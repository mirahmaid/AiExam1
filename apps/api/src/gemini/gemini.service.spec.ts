import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GeminiService, toOpenRouterMessages, splitTranscribedPages } from './gemini.service';

const mockEmbedContent = jest.fn();

/** Stands in for OpenRouter: each call resolves to whatever the test queued. */
const mockGenerateContent = jest.fn();
const fetchMock = jest.fn(async (_url: string, init: { body: string }) => {
  const result = await mockGenerateContent(JSON.parse(init.body));
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({ choices: [{ message: { content: result.text } }] }),
  };
});
global.fetch = fetchMock as unknown as typeof fetch;

jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        embedContent: mockEmbedContent,
      },
    })),
  };
});

describe('GeminiService', () => {
  let service: GeminiService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const map: Record<string, any> = {
                GEMINI_API_KEY: 'test-api-key',
                OPENROUTER_API_KEY: 'test-openrouter-key',
                OPENROUTER_PARSER_MODEL: 'google/gemini-2.5-flash',
                GEMINI_EMBEDDING_MODEL: 'text-embedding-004',
                EMBEDDING_DIMENSIONS: 768,
              };
              return map[key] ?? defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<GeminiService>(GeminiService);
    service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should extract structured questions with LaTeX from PDF buffer', async () => {
    const mockQuestions = [
      {
        questionText: 'Calculate $\\int_0^1 x^2 dx$',
        choices: [
          { label: 'A', text: '$\\frac{1}{3}$' },
          { label: 'B', text: '$\\frac{1}{2}$' },
        ],
        correctAnswer: 'A',
        explanation: '$\\frac{1}{3}$ is correct',
      },
    ];

    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({ questions: mockQuestions }),
    });

    const result = await service.extractQuestionsFromFile(Buffer.from('fake pdf'));
    expect(result).toHaveLength(1);
    expect(result[0].questionText).toContain('\\int_0^1');
    expect(result[0].correctAnswer).toBe('A');
  });

  it('should extract structured questions from image buffer', async () => {
    const mockQuestions = [
      {
        questionText: 'What is $E=mc^2$?',
        choices: [
          { label: 'A', text: 'Mass-energy equivalence' },
          { label: 'B', text: 'Thermodynamics' },
        ],
        correctAnswer: 'A',
        explanation: 'Einstein relation',
      },
    ];

    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({ questions: mockQuestions }),
    });

    const result = await service.extractQuestionsFromFile(
      Buffer.from('fake image'),
      'image/png',
    );
    expect(result).toHaveLength(1);
    expect(result[0].questionText).toBe('What is $E=mc^2$?');
    expect(result[0].correctAnswer).toBe('A');
  });

  it('should generate 768-dimensional float embedding', async () => {
    const mockEmbedding = new Array(768).fill(0.123);
    mockEmbedContent.mockResolvedValueOnce({
      embeddings: [{ values: mockEmbedding }],
    });

    const result = await service.generateEmbedding('Sample question text');
    expect(result).toHaveLength(768);
    expect(result[0]).toBe(0.123);
  });

  it('sends the PDF as a file part and the schema as response_format', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: '```json\n{"questions":[{"questionText":"Q","choices":[],"correctAnswer":"A"}]}\n```',
    });

    const result = await service.extractQuestionsFromFile(Buffer.from('pdf'));
    expect(result[0].questionText).toBe('Q');

    const body = mockGenerateContent.mock.calls[0][0];
    expect(body.model).toBe('google/gemini-2.5-flash');
    expect(body.response_format.type).toBe('json_schema');
    expect(body.provider).toEqual({ require_parameters: true });
    expect(body.messages[0].content[0]).toEqual({
      type: 'file',
      file: {
        filename: 'document.pdf',
        file_data: `data:application/pdf;base64,${Buffer.from('pdf').toString('base64')}`,
      },
    });
  });

  it('maps Gemini roles and images onto OpenRouter messages', () => {
    expect(
      toOpenRouterMessages([
        { role: 'user', parts: [{ inlineData: { mimeType: 'image/png', data: 'AA' } }, { text: 'hi' }] },
        { role: 'model', parts: [{ text: 'answer' }] },
      ]),
    ).toEqual([
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: 'data:image/png;base64,AA' } },
          { type: 'text', text: 'hi' },
        ],
      },
      { role: 'assistant', content: 'answer' },
    ]);
  });

  it('falls back to the next model when OpenRouter returns 429', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      json: async () => ({ error: { code: 429, message: 'Rate limit exceeded' } }),
    } as any);
    mockGenerateContent.mockResolvedValueOnce({ text: 'ok' });

    await expect(
      service.generateContentWithFallback({ preferredModel: 'busy/model', contents: 'hi' }),
    ).resolves.toEqual({ text: 'ok' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  describe('generateContentWithFallback timeouts', () => {
    // A hanging Gemini call used to block the request forever, and a
    // quota-exhausted key meant up to 7 sequential attempts with no ceiling.
    it('falls through to the next model when one hangs', async () => {
      jest.useFakeTimers();
      try {
        mockGenerateContent
          .mockImplementationOnce(() => new Promise(() => {})) // never settles
          .mockResolvedValueOnce({ text: 'from the second model' });

        const promise = service.generateContentWithFallback({
          preferredModel: 'hanging-model',
          contents: 'hi',
        });
        // let the per-attempt timeout fire
        await jest.advanceTimersByTimeAsync(31_000);

        await expect(promise).resolves.toEqual({ text: 'from the second model' });
        expect(mockGenerateContent).toHaveBeenCalledTimes(2);
      } finally {
        jest.useRealTimers();
      }
    });

    it('gives up once the whole chain exceeds its deadline', async () => {
      jest.useFakeTimers();
      try {
        mockGenerateContent.mockImplementation(() => new Promise(() => {}));

        const promise = service.generateContentWithFallback({ contents: 'hi' });
        const assertion = expect(promise).rejects.toThrow(/timed out|no model produced/);
        // four 30s attempts would exceed the 90s ceiling
        await jest.advanceTimersByTimeAsync(200_000);
        await assertion;
      } finally {
        jest.useRealTimers();
      }
    });
  });
});

describe('splitTranscribedPages', () => {
  it('splits on book page numbers', () => {
    expect(splitTranscribedPages('===== PAGE 5 =====\nأ\n===== PAGE 6 =====\nب', 5, 2)).toEqual([
      { page: 5, text: 'أ' },
      { page: 6, text: 'ب' },
    ]);
  });

  it('accepts bold/Arabic markers and relative 1..n numbering', () => {
    const text = '**===== صفحة 1 =====**\nأ\n## ===== PAGE 2 =====\nب';
    expect(splitTranscribedPages(text, 29, 2)).toEqual([
      { page: 29, text: 'أ' },
      { page: 30, text: 'ب' },
    ]);
  });

  it('keeps unmarked text on the first page and returns nothing for an empty reply', () => {
    expect(splitTranscribedPages('نص بلا فواصل', 7, 4)).toEqual([{ page: 7, text: 'نص بلا فواصل' }]);
    expect(splitTranscribedPages('   ', 7, 4)).toEqual([]);
  });
});
