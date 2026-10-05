import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GeminiService } from '../../gemini/gemini.service';
import {
  GenerationPromptBuilder,
  BankQuestionAnchor,
} from '../builders/generation-prompt.builder';
import { GenerateQuestionsDto } from '../dto/generate-questions.dto';
import { ReferenceMetadata } from '../interfaces/generated-question.interface';
import { DifficultyLevel, BloomTaxonomyLevel, Prisma } from '@prisma/client';
import {
  KnowledgeRetrievalService,
  RetrievedChunk,
} from '../../knowledge/services/knowledge-retrieval.service';

/** كم مقطع من الكتاب المدرسي منحط بالـ prompt */
const MAX_TEXTBOOK_PASSAGES = 4;

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

@Injectable()
export class QuestionGenerationService {
  private readonly logger = new Logger(QuestionGenerationService.name);
  private isPgVectorAvailable: boolean | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiService,
    private readonly promptBuilder: GenerationPromptBuilder,
    private readonly retrieval: KnowledgeRetrievalService,
  ) {}

  /**
   * Core RAG pipeline (US-14):
   * 1. Generate a 768d query embedding from the topic/subject
   * 2. Retrieve top-N approved bank questions via pgvector cosine distance
   * 3. Build a few-shot system prompt strictly grounded in Palestinian curriculum
   * 4. Call Gemini with structured output schema + self-healing retry
   * 5. Persist results in generated_questions with BANK_RAG source type
   */
  async generateFromBank(
    studentId: string,
    dto: GenerateQuestionsDto,
  ): Promise<object[]> {
    const { subjectId, topicId, difficulty, bloomTaxonomy, count } = dto;

    // ── 1. Validate subject exists ──────────────────────────────
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
      include: { branch: true },
    });
    if (!subject) throw new NotFoundException('Subject not found');

    // ── 2. Build semantic query text ────────────────────────────
    const queryText = [
      `subject:${subject.name}`,
      subject.branch?.name ? `branch:${subject.branch.name}` : '',
      topicId ? `topic:${topicId}` : '',
      `difficulty:${difficulty}`,
      bloomTaxonomy ? `bloom:${bloomTaxonomy}` : '',
    ]
      .filter(Boolean)
      .join(' ');

    // ── 3. Generate query embedding (768d) ──────────────────────
    let queryEmbedding: number[] = [];
    try {
      queryEmbedding = await this.gemini.generateEmbedding(
        queryText,
        'query',
      );
    } catch (err) {
      this.logger.warn(
        `Embedding generation failed, falling back to metadata filter: ${String(err)}`,
      );
    }

    // ── 4. Retrieve top-N bank questions via hybrid retrieval ───
    const anchors = await this.retrieveBankAnchors(
      subjectId,
      topicId,
      difficulty,
      bloomTaxonomy,
      queryEmbedding,
    );

    // ── 4b. مقاطع من الكتاب المدرسي (الاسترجاع الهجين) ──────────
    const passages = await this.retrieveTextbookPassages(
      subjectId,
      [subject.name, topicId, bloomTaxonomy ? `مستوى ${bloomTaxonomy}` : ''].filter(Boolean).join(' '),
      topicId,
    );

    // Strict grounding: at least one official reference — a bank question or
    // a passage from the ministry textbook — must exist.
    if (anchors.length === 0 && passages.length === 0) {
      throw new BadRequestException(
        `No approved Palestinian exam bank questions or indexed textbook passages found for subject "${subject.name}" (Branch: "${subject.branch?.name ?? 'General'}"). Question generation requires official curriculum references for strict grounding.`,
      );
    }

    const bankQuestionIds = anchors.map((a) => a.id);

    // ── 5. Build few-shot prompt ────────────────────────────────
    const prompt = this.promptBuilder.buildBankRagPrompt(
      anchors,
      subject,
      topicId,
      difficulty,
      bloomTaxonomy,
      count,
      passages,
    );

    // ── 6. Generate questions via Gemini (with self-healing retry)
    const generated = await this.gemini.generateQuestions(prompt, count);

    // ── 7. Persist generated questions ─────────────────────────
    const referenceMetadata: ReferenceMetadata = {
      bankQuestionIds,
      textbookChunkIds: passages.map((p) => p.id),
    };

    const created = await Promise.all(
      generated.map((q) =>
        this.prisma.generatedQuestion.create({
          data: {
            studentId,
            subjectId,
            topicId: topicId ?? null,
            questionText: q.questionText,
            choices: q.choices as unknown as Prisma.InputJsonValue,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            bloomTaxonomy: (q.bloomTaxonomy as BloomTaxonomyLevel) ?? null,
            difficulty: difficulty as DifficultyLevel,
            sourceType: 'BANK_RAG',
            referenceMetadata: referenceMetadata as unknown as Prisma.InputJsonValue,
          },
          select: {
            id: true,
            questionText: true,
            choices: true,
            correctAnswer: true,
            explanation: true,
            bloomTaxonomy: true,
            difficulty: true,
            sourceType: true,
            referenceMetadata: true,
            subjectId: true,
            topicId: true,
            createdAt: true,
          },
        }),
      ),
    );

    if (bankQuestionIds.length) {
      await this.prisma.examBankQuestion.updateMany({
        where: { id: { in: bankQuestionIds } },
        data: { usageCount: { increment: 1 } },
      });
    }

    this.logger.log(
      `Generated and persisted ${created.length} questions (BANK_RAG, ${anchors.length} bank anchors, ${passages.length} textbook passages) for student ${studentId}`,
    );

    return created;
  }


  /**
   * مقاطع الكتاب الأقرب للطلب. الفشل هون ما بيوقف التوليد — أسئلة البنك
   * لحالها كافية كمرجع.
   */
  private async retrieveTextbookPassages(
    subjectId: string,
    query: string,
    unit: string | undefined,
  ): Promise<RetrievedChunk[]> {
    try {
      let passages = unit
        ? await this.retrieval.search({ subjectId, query, unit, limit: MAX_TEXTBOOK_PASSAGES })
        : [];
      // topicId نص حر؛ إذا ما طابق وحدة بالكتاب منبحث بكل المادة
      if (passages.length === 0) {
        passages = await this.retrieval.search({ subjectId, query, limit: MAX_TEXTBOOK_PASSAGES });
      }
      return passages;
    } catch (err) {
      this.logger.warn(`Textbook retrieval failed, continuing with bank anchors only: ${String(err)}`);
      return [];
    }
  }

  /**
   * Check if pgvector extension is installed and active in PostgreSQL.
   * Probes the pg_type system catalog to prevent throwing SQL type errors.
   */
  private async hasPgVectorSupport(): Promise<boolean> {
    if (this.isPgVectorAvailable !== null) {
      return this.isPgVectorAvailable;
    }
    try {
      const result = await this.prisma.$queryRawUnsafe<{ exists: boolean }[]>(
        `SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vector') as "exists"`,
      );
      this.isPgVectorAvailable = Boolean(result?.[0]?.exists);
    } catch {
      this.isPgVectorAvailable = false;
    }
    return this.isPgVectorAvailable;
  }

  /**
   * Retrieve top-3 to 5 approved ExamBankQuestions using pgvector cosine distance
   * filtered by subject, difficulty, bloomTaxonomy, and not soft-deleted.
   */
  private async retrieveBankAnchors(
    subjectId: string,
    topicId: string | undefined,
    difficulty: DifficultyLevel,
    bloomTaxonomy: BloomTaxonomyLevel | undefined,
    queryEmbedding: number[],
  ): Promise<BankQuestionAnchor[]> {
    const MAX_ANCHORS = 5;

    const hasPgVector =
      queryEmbedding.length > 0 && (await this.hasPgVectorSupport());

    if (hasPgVector) {
      // pgvector cosine distance query — uses HNSW index for O(log n) retrieval
      const embeddingLiteral = `'[${queryEmbedding.join(',')}]'`;

      // Helper to query pgvector with given predicates
      const queryVectorWithPredicates = async (preds: string[]) => {
        const whereClause = preds.join(' AND ');
        return this.prisma.$queryRawUnsafe<
          {
            id: string;
            questionText: string;
            choices: unknown;
            correctAnswer: string;
            explanation: string | null;
            bloomTaxonomy: string;
            difficulty: string;
          }[]
        >(
          `SELECT id, "questionText", choices, "correctAnswer", explanation, "bloomTaxonomy", difficulty
           FROM "ExamBankQuestion"
           WHERE ${whereClause}
           ORDER BY embedding::vector <=> ${embeddingLiteral}::vector
           LIMIT ${MAX_ANCHORS}`,
        );
      };

      try {
        // 1. Try strict match (subject + difficulty + bloom + topic)
        const strictPreds: string[] = [
          `"deletedAt" IS NULL`,
          `"embeddingStatus" = 'INDEXED'`,
          `"subjectId" = '${subjectId}'`,
          `difficulty = '${difficulty}'::"DifficultyLevel"`,
        ];
        if (bloomTaxonomy) {
          strictPreds.push(
            `"bloomTaxonomy" = '${bloomTaxonomy}'::"BloomTaxonomyLevel"`,
          );
        }
        if (topicId) {
          strictPreds.push(`"topicId" = '${topicId}'`);
        }

        let rows = await queryVectorWithPredicates(strictPreds);

        // 2. Relax bloom and topic if no strict match
        if (rows.length === 0 && (bloomTaxonomy || topicId)) {
          const relaxedPreds = [
            `"deletedAt" IS NULL`,
            `"embeddingStatus" = 'INDEXED'`,
            `"subjectId" = '${subjectId}'`,
            `difficulty = '${difficulty}'::"DifficultyLevel"`,
          ];
          rows = await queryVectorWithPredicates(relaxedPreds);
        }

        // 3. Relax difficulty to any approved question in this subject
        if (rows.length === 0) {
          const subjectOnlyPreds = [
            `"deletedAt" IS NULL`,
            `"embeddingStatus" = 'INDEXED'`,
            `"subjectId" = '${subjectId}'`,
          ];
          rows = await queryVectorWithPredicates(subjectOnlyPreds);
        }

        if (rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            questionText: r.questionText,
            choices: r.choices as { label: string; text: string }[],
            correctAnswer: r.correctAnswer,
            explanation: r.explanation,
            bloomTaxonomy: r.bloomTaxonomy,
            difficulty: r.difficulty,
          }));
        }
      } catch (err) {
        this.isPgVectorAvailable = false;
        this.logger.debug(
          `pgvector query execution failed, falling back to in-memory cosine ranking: ${String(err)}`,
        );
      }
    }

    // Fallback: Prisma-filtered retrieval with progressive relaxation
    const selectFields = {
      id: true,
      questionText: true,
      choices: true,
      correctAnswer: true,
      explanation: true,
      bloomTaxonomy: true,
      difficulty: true,
      embedding: true,
    };

    // 1. Try strict Prisma query
    const whereStrict: Prisma.ExamBankQuestionWhereInput = {
      deletedAt: null,
      subjectId,
      difficulty,
    };
    if (bloomTaxonomy) whereStrict.bloomTaxonomy = bloomTaxonomy;
    if (topicId) whereStrict.topicId = topicId;

    let fallback = await this.prisma.examBankQuestion.findMany({
      where: whereStrict,
      take: queryEmbedding.length > 0 ? 50 : MAX_ANCHORS,
      orderBy: { createdAt: 'desc' },
      select: selectFields,
    });

    // 2. Relax bloom and topic if 0 results
    if (fallback.length === 0 && (bloomTaxonomy || topicId)) {
      fallback = await this.prisma.examBankQuestion.findMany({
        where: { deletedAt: null, subjectId, difficulty },
        take: queryEmbedding.length > 0 ? 50 : MAX_ANCHORS,
        orderBy: { createdAt: 'desc' },
        select: selectFields,
      });
    }

    // 3. Relax difficulty to any question for this subject if 0 results
    if (fallback.length === 0) {
      fallback = await this.prisma.examBankQuestion.findMany({
        where: { deletedAt: null, subjectId },
        take: queryEmbedding.length > 0 ? 50 : MAX_ANCHORS,
        orderBy: { createdAt: 'desc' },
        select: selectFields,
      });
    }

    if (queryEmbedding.length > 0 && fallback.length > 0) {
      fallback.sort((a, b) => {
        const scoreA = cosineSimilarity(queryEmbedding, a.embedding);
        const scoreB = cosineSimilarity(queryEmbedding, b.embedding);
        return scoreB - scoreA;
      });
    }

    return fallback.slice(0, MAX_ANCHORS).map((r) => ({
      id: r.id,
      questionText: r.questionText,
      choices: r.choices as { label: string; text: string }[],
      correctAnswer: r.correctAnswer,
      explanation: r.explanation,
      bloomTaxonomy: r.bloomTaxonomy,
      difficulty: r.difficulty,
    }));
  }
}
