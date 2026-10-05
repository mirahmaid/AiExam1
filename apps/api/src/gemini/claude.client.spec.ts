import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import {
  isTransientClaudeError,
  strictSchema,
  toClaudeMessages,
} from './claude.client';
import { GeminiService } from './gemini.service';

describe('toClaudeMessages', () => {
  it('maps PDFs to document blocks, images to image blocks, and model turns to assistant', () => {
    const messages = toClaudeMessages([
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'application/pdf', data: 'UERG' } },
          { inlineData: { mimeType: 'image/png', data: 'iVBO' } },
          { text: 'فرّغ الصفحات' },
        ],
      },
      { role: 'model', parts: [{ text: 'تم' }] },
    ]);
    expect(messages).toEqual([
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: 'UERG',
            },
          },
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/png', data: 'iVBO' },
          },
          { type: 'text', text: 'فرّغ الصفحات' },
        ],
      },
      { role: 'assistant', content: [{ type: 'text', text: 'تم' }] },
    ]);
  });

  it('rejects file types Claude cannot read instead of sending them', () => {
    expect(() =>
      toClaudeMessages([
        { parts: [{ inlineData: { mimeType: 'application/zip', data: 'x' } }] },
      ]),
    ).toThrow('application/zip');
  });
});

describe('strictSchema', () => {
  it('adds additionalProperties: false to every object, nested ones included', () => {
    const schema = {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: { a: { type: 'string', enum: ['x'] } },
          },
        },
      },
      required: ['questions'],
    };
    expect(strictSchema(schema)).toEqual({
      type: 'object',
      additionalProperties: false,
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: { a: { type: 'string', enum: ['x'] } },
          },
        },
      },
      required: ['questions'],
    });
  });
});

describe('GeminiService with Claude as the primary provider', () => {
  const fetchMock = jest.fn();
  let service: GeminiService;
  let claudeGenerate: jest.SpyInstance;

  function build(env: Record<string, string>) {
    const config = {
      get: (k: string, d?: unknown) => env[k] ?? d,
    } as unknown as ConfigService;
    const s = new GeminiService(config);
    s.onModuleInit();
    return s;
  }

  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'from openrouter' } }],
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    service = build({
      ANTHROPIC_API_KEY: 'sk-ant-test',
      OPENROUTER_API_KEY: 'sk-or-test',
    });
    claudeGenerate = jest.spyOn((service as any).claude, 'generate');
  });

  it('sends the request to Claude with the task effort and the JSON schema', async () => {
    claudeGenerate.mockResolvedValue('```json\n{"ok":true}\n```');
    const schema = { type: 'object', properties: { ok: { type: 'boolean' } } };
    const res = await service.generateContentWithFallback({
      contents: 'hi',
      config: { responseSchema: schema },
      effort: 'low',
      claudeTimeoutMs: 1000,
    });
    expect(res.text).toBe('{"ok":true}');
    expect(claudeGenerate).toHaveBeenCalledWith({
      contents: 'hi',
      schema,
      effort: 'low',
      timeoutMs: 1000,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('falls back to OpenRouter when Claude is overloaded', async () => {
    claudeGenerate.mockRejectedValue(
      new Anthropic.APIConnectionError({ message: 'socket hang up' }),
    );
    const res = await service.generateContentWithFallback({ contents: 'hi' });
    expect(res.text).toBe('from openrouter');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not hide request errors behind the fallback', async () => {
    const bad = Object.assign(
      Object.create(Anthropic.BadRequestError.prototype),
      { status: 400, message: 'bad pdf' },
    );
    claudeGenerate.mockRejectedValue(bad);
    await expect(
      service.generateContentWithFallback({ contents: 'hi' }),
    ).rejects.toBe(bad);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reads bigger page batches with Claude', () => {
    expect(service.documentPagesPerRequest('ocr')).toBe(10);
    expect(
      build({ OPENROUTER_API_KEY: 'k' }).documentPagesPerRequest('ocr'),
    ).toBe(4);
  });

  it('defaults to local embeddings when there is no Gemini key', () => {
    expect(service.embeddingInfo()).toMatchObject({
      enabled: true,
      provider: 'local',
      dimensions: 384,
    });
    expect(
      build({
        OPENROUTER_API_KEY: 'k',
        EMBEDDING_PROVIDER: 'openrouter',
      }).embeddingInfo().provider,
    ).toBe('openrouter');
  });

  it('classifies transient errors', () => {
    expect(
      isTransientClaudeError(
        new Anthropic.APIConnectionError({ message: 'x' }),
      ),
    ).toBe(true);
    expect(isTransientClaudeError(new Error('x'))).toBe(false);
  });
});
