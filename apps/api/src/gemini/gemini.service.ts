import {
  Injectable,
  Logger,
  OnModuleInit,
  InternalServerErrorException,
  BadGatewayException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

/** Shape of a single question extracted by Gemini from a PDF */
export interface ExtractedQuestion {
  questionText: string;
  choices: { label: string; text: string }[];
  correctAnswer: string;
  explanation?: string;
}

/** Shape of a single AI-generated question (Sprint 3) */
export interface GeneratedQuestion {
  questionText: string;
  choices: { label: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  bloomTaxonomy: string;
}

/** Style blueprint extracted from an uploaded student question sheet (Sprint 3) */
export interface StyleMatrix {
  averageQuestionLength: number;     // avg word count per question
  latexDensity: 'LOW' | 'MEDIUM' | 'HIGH'; // fraction of questions using LaTeX
  distractorComplexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX';
  cognitiveDepth: string;            // e.g. "REMEMBER", "APPLY", "ANALYZE"
  questionStructureNotes: string;    // free-text style observations
  sampleQuestions: string[];         // 2â€“3 verbatim samples for prompt injection
}

/**
 * JSON-schema constraint passed to Gemini so it returns valid structured output.
 * All mathematical/chemical formulas are normalized to LaTeX ($...$ inline, $$...$$ block).
 */
const EXTRACTION_SCHEMA = {
  type: 'object' as const,
  properties: {
    questions: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          questionText: {
            type: 'string' as const,
            description:
              'The full question text. Normalize all mathematical and chemical formulas into valid LaTeX: use $...$ for inline math and $$...$$ for display/block math.',
          },
          choices: {
            type: 'array' as const,
            items: {
              type: 'object' as const,
              properties: {
                label: {
                  type: 'string' as const,
                  description: 'Choice label, e.g. "A", "B", "C", "D"',
                },
                text: {
                  type: 'string' as const,
                  description:
                    'Choice text. Normalize formulas into valid LaTeX.',
                },
              },
              required: ['label', 'text'],
            },
          },
          correctAnswer: {
            type: 'string' as const,
            description:
              'The label of the correct choice, e.g. "A", "B", "C", or "D"',
          },
          explanation: {
            type: 'string' as const,
            description:
              'Optional explanation of the correct answer. Normalize formulas into valid LaTeX.',
          },
        },
        required: ['questionText', 'choices', 'correctAnswer'],
      },
    },
  },
  required: ['questions'],
};

/** JSON schema for Sprint 3 AI-generated question output */
const GENERATION_SCHEMA = {
  type: 'object' as const,
  properties: {
    questions: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          questionText: {
            type: 'string' as const,
            description:
              'Full question text. Use $...$ for inline LaTeX and $$...$$ for display math.',
          },
          choices: {
            type: 'array' as const,
            items: {
              type: 'object' as const,
              properties: {
                label: { type: 'string' as const },
                text: {
                  type: 'string' as const,
                  description: 'Choice text with LaTeX-normalized formulas.',
                },
              },
              required: ['label', 'text'],
            },
            description: 'Exactly 4 answer choices labelled A, B, C, D.',
          },
          correctAnswer: {
            type: 'string' as const,
            description: 'Label of the correct choice: "A", "B", "C", or "D".',
          },
          explanation: {
            type: 'string' as const,
            description:
              'Concise explanation of why the correct answer is correct. LaTeX-normalized.',
          },
          bloomTaxonomy: {
            type: 'string' as const,
            enum: [
              'REMEMBER',
              'UNDERSTAND',
              'APPLY',
              'ANALYZE',
              'EVALUATE',
              'CREATE',
            ],
            description: "Bloom's Taxonomy level this question targets.",
          },
        },
        required: [
          'questionText',
          'choices',
          'correctAnswer',
          'explanation',
          'bloomTaxonomy',
        ],
      },
    },
  },
  required: ['questions'],
};

/** JSON schema for style matrix extraction */
const STYLE_MATRIX_SCHEMA = {
  type: 'object' as const,
  properties: {
    averageQuestionLength: {
      type: 'number' as const,
      description: 'Average word count per question in the document.',
    },
    latexDensity: {
      type: 'string' as const,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      description: 'Proportion of questions containing LaTeX math notation.',
    },
    distractorComplexity: {
      type: 'string' as const,
      enum: ['SIMPLE', 'MODERATE', 'COMPLEX'],
      description: 'Overall complexity level of wrong answer choices.',
    },
    cognitiveDepth: {
      type: 'string' as const,
      enum: [
        'REMEMBER',
        'UNDERSTAND',
        'APPLY',
        'ANALYZE',
        'EVALUATE',
        'CREATE',
      ],
      description: "Dominant Bloom's Taxonomy level in the document.",
    },
    questionStructureNotes: {
      type: 'string' as const,
      description:
        'Free-text observations about question phrasing style, tone, and structure.',
    },
    sampleQuestions: {
      type: 'array' as const,
      items: { type: 'string' as const },
      description: '2â€“3 verbatim sample questions from the document.',
    },
  },
  required: [
    'averageQuestionLength',
    'latexDensity',
    'distractorComplexity',
    'cognitiveDepth',
    'questionStructureNotes',
    'sampleQuestions',
  ],
};

/** Per-attempt ceiling for a single Gemini call. */
const GEMINI_ATTEMPT_TIMEOUT_MS = 30_000;

/** Ceiling for the whole fallback chain, so 7 models cannot stack up. */
const GEMINI_TOTAL_TIMEOUT_MS = 90_000;

class GeminiTimeoutError extends Error {
  constructor(model: string, ms: number) {
    super(`Gemini model "${model}" timed out after ${ms}ms`);
    this.name = 'GeminiTimeoutError';
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, model: string): Promise<T> {
  let timer: NodeJS.Timeout;
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new GeminiTimeoutError(model, ms)), ms);
    }),
  ]).finally(() => clearTimeout(timer)) as Promise<T>;
}

@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly logger = new Logger(GeminiService.name);
  private ai: GoogleGenAI;
  private parserModel: string;
  private generationModel: string;
  private embeddingModel: string;
  private embeddingDimensions: number;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const apiKey = this.config.get<string>('GEMINI_API_KEY', '');
    this.parserModel = this.config.get<string>(
      'GEMINI_PARSER_MODEL',
      'gemini-3.5-flash',
    );
    this.generationModel = this.config.get<string>(
      'GEMINI_GENERATION_MODEL',
      'gemini-3.5-flash',
    );
    this.embeddingModel = this.config.get<string>(
      'GEMINI_EMBEDDING_MODEL',
      'gemini-embedding-001',
    );
    this.embeddingDimensions = this.config.get<number>(
      'EMBEDDING_DIMENSIONS',
      768,
    );

    this.ai = new GoogleGenAI({ apiKey });
    this.logger.log(
      `Gemini initialized (parser: ${this.parserModel}, generation: ${this.generationModel}, embeddings: ${this.embeddingModel} @ ${this.embeddingDimensions}d)`,
    );
  }

  /**
   * Resilient wrapper around generateContent with automatic multi-model fallback.
   * If primary model hits 429 (quota exhausted) or 503 (high demand), it seamlessly
   * fails over to alternate models in order of priority.
   */
  async generateContentWithFallback(params: {
    preferredModel?: string;
    contents: any;
    config?: any;
  }): Promise<{ text?: string }> {
    const candidates = [
      params.preferredModel,
      this.parserModel,
      this.generationModel,
      'gemini-3.5-flash',
      'gemini-flash-latest',
      'gemini-3.7-flash',
      'gemini-3.5-flash-lite',
    ];
    const modelsToTry = Array.from(
      new Set(candidates.filter(Boolean) as string[]),
    );
    let lastError: any = null;
    // بدون سقف، مفتاح مستهلك الحصة بيعني 7 محاولات متتالية بلا أي مهلة
    const deadline = Date.now() + GEMINI_TOTAL_TIMEOUT_MS;

    for (const model of modelsToTry) {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        this.logger.error(
          `Gemini fallback chain exceeded ${GEMINI_TOTAL_TIMEOUT_MS}ms; giving up before trying "${model}"`,
        );
        break;
      }

      try {
        const response = await withTimeout(
          this.ai.models.generateContent({
            model,
            contents: params.contents,
            config: params.config,
          }),
          Math.min(GEMINI_ATTEMPT_TIMEOUT_MS, remaining),
          model,
        );
        return response;
      } catch (err: any) {
        lastError = err;
        const msg = err?.message ?? String(err);
        const isQuotaOrCapacity =
          err instanceof GeminiTimeoutError ||
          msg.includes('429') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('503') ||
          msg.includes('high demand') ||
          msg.includes('Quota exceeded') ||
          msg.includes('not found') ||
          msg.includes('no longer available');

        if (isQuotaOrCapacity) {
          this.logger.warn(
            `Model "${model}" unavailable (${msg.slice(0, 100)}...). Falling back to next model...`,
          );
          continue;
        }

        throw err;
      }
    }

    this.logger.error(
      `All Gemini fallback models exhausted. Last error: ${lastError?.message}`,
    );
    // لو خرجنا بدون خطأ مسجّل (انتهت المهلة الكلية)، منرمي خطأ واضح
    // بدل `throw null`
    throw (
      lastError ??
      new Error('Gemini request failed: no model produced a response in time')
    );
  }

  /**
   * Send a PDF or image buffer to Gemini for multimodal extraction.
   * Returns an array of structured questions with LaTeX-normalized formulas.
   */
  async extractQuestionsFromFile(
    fileBuffer: Buffer,
    mimeType: string = 'application/pdf',
  ): Promise<ExtractedQuestion[]> {
    const base64 = fileBuffer.toString('base64');

    const response = await this.generateContentWithFallback({
      preferredModel: this.parserModel,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64,
              },
            },
            {
              text: `You are an expert exam question parser. Extract ALL multiple-choice questions from this exam document (PDF or image).

For each question:
1. Extract the full question text, preserving all mathematical and chemical formulas.
2. Normalize ALL formulas into valid LaTeX: use $...$ for inline math and $$...$$ for display/block math.
3. Extract all answer choices with their labels (A, B, C, D, etc.).
4. Identify the correct answer label if marked in the document.
5. Provide a brief explanation if available.

Return the results as a JSON object with a "questions" array.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: EXTRACTION_SCHEMA,
      },
    });

    const text = response.text ?? '';
    let parsed: { questions: ExtractedQuestion[] };

    try {
      parsed = JSON.parse(text);
    } catch {
      this.logger.error(`Gemini returned invalid JSON: ${text.slice(0, 500)}`);
      throw new InternalServerErrorException(
        'Gemini returned non-parseable JSON output',
      );
    }

    if (!Array.isArray(parsed.questions)) {
      throw new InternalServerErrorException(
        'Gemini response missing "questions" array',
      );
    }

    this.logger.log(
      `Extracted ${parsed.questions.length} questions from ${mimeType} via ${this.parserModel}`,
    );
    return parsed.questions;
  }

  /**
   * Generate exam questions using structured JSON output.
   * Implements self-healing retry: on schema validation failure, the error is
   * appended to the prompt and Gemini is called again (up to `maxRetries` times).
   * Throws BadGatewayException if all attempts fail.
   */
  async generateQuestions(
    systemPrompt: string,
    count: number,
    maxRetries = 2,
  ): Promise<GeneratedQuestion[]> {
    let lastError = '';
    let conversationHistory: { role: string; parts: { text: string }[] }[] = [
      { role: 'user', parts: [{ text: systemPrompt }] },
    ];

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.generateContentWithFallback({
          preferredModel: this.generationModel,
          contents: conversationHistory,
          config: {
            responseMimeType: 'application/json',
            responseSchema: GENERATION_SCHEMA,
          },
        });

        const text = response.text ?? '';
        let parsed: { questions: GeneratedQuestion[] };

        try {
          parsed = JSON.parse(text);
        } catch (parseErr) {
          lastError = `JSON parse error: ${String(parseErr)}`;
          this.logger.warn(
            `Attempt ${attempt + 1}: JSON parse failed — ${lastError}`,
          );
          // Add model response + repair instruction for next attempt
          conversationHistory = [
            ...conversationHistory,
            { role: 'model', parts: [{ text }] },
            {
              role: 'user',
              parts: [
                {
                  text: `Your previous response was not valid JSON. Error: ${lastError}\nPlease regenerate exactly ${count} questions as valid JSON matching the schema.`,
                },
              ],
            },
          ];
          continue;
        }

        // Validate schema shape
        if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
          lastError = 'Response missing "questions" array or array is empty';
          this.logger.warn(`Attempt ${attempt + 1}: ${lastError}`);
          conversationHistory = [
            ...conversationHistory,
            { role: 'model', parts: [{ text }] },
            {
              role: 'user',
              parts: [
                {
                  text: `Validation error: ${lastError}\nPlease regenerate exactly ${count} questions as valid JSON matching the schema.`,
                },
              ],
            },
          ];
          continue;
        }

        // Validate each question has required fields
        const invalid = parsed.questions.filter(
          (q) =>
            !q.questionText ||
            !Array.isArray(q.choices) ||
            q.choices.length === 0 ||
            !q.correctAnswer ||
            !q.explanation ||
            !q.bloomTaxonomy,
        );

        if (invalid.length > 0) {
          lastError = `${invalid.length} questions are missing required fields (choices, correctAnswer, explanation, or bloomTaxonomy)`;
          this.logger.warn(`Attempt ${attempt + 1}: ${lastError}`);
          conversationHistory = [
            ...conversationHistory,
            { role: 'model', parts: [{ text }] },
            {
              role: 'user',
              parts: [
                {
                  text: `Validation error: ${lastError}\nPlease regenerate exactly ${count} questions ensuring every question has questionText, choices (A–D), correctAnswer, explanation, and bloomTaxonomy.`,
                },
              ],
            },
          ];
          continue;
        }

        this.logger.log(
          `Generated ${parsed.questions.length} questions (attempt ${attempt + 1})`,
        );
        return parsed.questions.slice(0, count);
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        if (attempt < maxRetries) {
          this.logger.warn(
            `Attempt ${attempt + 1} failed with upstream error: ${lastError}. Retrying...`,
          );
        }
      }
    }

    this.logger.error(
      `All ${maxRetries + 1} generation attempts exhausted. Last error: ${lastError}`,
    );
    throw new BadGatewayException(
      'AI question generation failed after multiple retries. Please try again later.',
    );
  }

  /**
   * Analyze a question sheet (PDF or image) and extract its style blueprint.
   * Returns a StyleMatrix JSON object cached by the caller.
   */
  async extractStyleMatrix(
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<StyleMatrix> {
    const base64 = fileBuffer.toString('base64');

    const response = await this.generateContentWithFallback({
      preferredModel: this.parserModel,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64,
              },
            },
            {
              text: `You are an expert educational assessment analyst. Analyze this question sheet document and extract a comprehensive style blueprint.

Analyze and report:
1. Average question length (word count per question)
2. LaTeX math notation density (LOW = <20%, MEDIUM = 20-60%, HIGH = >60% of questions)
3. Distractor (wrong answer) complexity level
4. Dominant Bloom's Taxonomy cognitive level
5. Key observations about question phrasing, tone, and structure style
6. 2-3 verbatim sample questions from the document

Return a JSON style matrix object matching the schema.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: STYLE_MATRIX_SCHEMA,
      },
    });

    const text = response.text ?? '';
    let parsed: StyleMatrix;

    try {
      parsed = JSON.parse(text) as StyleMatrix;
    } catch {
      this.logger.error(
        `Style matrix extraction returned invalid JSON: ${text.slice(0, 300)}`,
      );
      throw new InternalServerErrorException(
        'Gemini style extraction returned non-parseable JSON',
      );
    }

    this.logger.log(`Style matrix extracted successfully`);
    return parsed;
  }

  /**
   * Generate a vector embedding for the given text.
   * Returns a float array of `embeddingDimensions` dimensions.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.ai.models.embedContent({
      model: this.embeddingModel,
      contents: text,
      config: {
        outputDimensionality: this.embeddingDimensions,
      },
    });

    const values =
      response.embeddings?.[0]?.values ??
      (response as unknown as { embedding?: { values?: number[] } }).embedding
        ?.values;
    if (!values || values.length === 0) {
      throw new InternalServerErrorException(
        'Gemini returned empty embedding vector',
      );
    }

    return values;
  }

  /**
   * Classify a student's free-text message into a structured intent.
   * Returns raw JSON text for the caller to parse.
   */
  async classifyIntent(prompt: string): Promise<string> {
    const response = await this.generateContentWithFallback({
      preferredModel: this.generationModel,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text ?? '';
    this.logger.debug(`Intent classification raw response: ${text.slice(0, 300)}`);
    return text;
  }

  /**
   * Validate whether an uploaded file's content matches the expected subject.
   * Uses multimodal analysis to detect the subject of the file content.
   * Returns raw JSON text for the caller to parse.
   */
  async validateFileContent(
    fileBuffer: Buffer,
    mimeType: string,
    expectedSubject: string,
    branchName: string,
  ): Promise<string> {
    const base64 = fileBuffer.toString('base64');

    const response = await this.generateContentWithFallback({
      preferredModel: this.parserModel,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64,
              },
            },
            {
              text: `You are a content validator for a Palestinian Tawjihi (الثانوية العامة) exam preparation system.

The student is currently in a chat session for the subject: "${expectedSubject}" (Branch: "${branchName}").
They uploaded this file. Analyze the file content and determine:

1. What subject does this file's content belong to?
2. Is the content relevant and appropriate for "${expectedSubject}"?
3. Does it contain exam questions, educational material, or study content?

Respond with ONLY a valid JSON object:
{
  "isRelevant": true | false,
  "detectedSubject": "the subject you detected in the file",
  "confidence": 0.95,
  "reason": "Brief explanation in Arabic of your assessment"
}

Rules:
- If the file contains questions/content about "${expectedSubject}", set isRelevant = true
- If the file is about a DIFFERENT subject entirely, set isRelevant = false
- If the file contains non-educational content (memes, personal photos, etc.), set isRelevant = false
- If you cannot determine the content (corrupted, unreadable), set isRelevant = false with reason explaining why`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    return response.text ?? '';
  }

}
