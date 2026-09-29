import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';

const mockGenerateContent = jest.fn();
const mockEmbedContent = jest.fn();

jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent,
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
                GEMINI_PARSER_MODEL: 'gemini-3.6-flash',
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
