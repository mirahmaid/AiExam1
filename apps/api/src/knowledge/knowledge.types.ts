/**
 * خيارات خط المعالجة — نفس الإعدادات يلي بلوحة «رفع ومعالجة الملفات».
 *
 * بتنحفظ مع كل ملف (KnowledgeDocument.options) حتى إعادة المحاولة وإعادة
 * التضمين يمشوا بنفس الإعدادات يلي بدأ فيها، وآخر خيارات استُعملت
 * بتنحفظ كافتراضية للدفعة الجاية (AppSetting "ingestion.defaults").
 */
export type ChunkStrategy = 'structure' | 'semantic' | 'fixed';
export type OcrLanguage = 'ara+eng' | 'ara' | 'eng';

export interface IngestionOptions {
  /** التعرّف الضوئي بالنموذج بدل طبقة النص تبع الـ PDF */
  ocr: boolean;
  ocrLang: OcrLanguage;
  strategy: ChunkStrategy;
  /** حجم المقطع بالتوكن */
  chunkSize: number;
  /** التداخل بين المقاطع المتتالية بالتوكن */
  overlap: number;
  /** حذف الترويسات والتذييلات المتكررة وأرقام الصفحات */
  stripHeaders: boolean;
  /** إبقاء المعادلات بصيغة LaTeX، وإلا بتتحوّل لنص عادي */
  keepLatex: boolean;
  /** توليد التضمين مباشرة بعد التقطيع */
  embedNow: boolean;
  /** امتحانات: تخطّي الأسئلة المكررة في البنك */
  dedupe: boolean;
  /** امتحانات: اعتماد تلقائي للأسئلة الواثقة */
  autoApprove: boolean;
  /** امتحانات: حد الثقة للاعتماد التلقائي */
  threshold: number;
}

export const DEFAULT_INGESTION_OPTIONS: IngestionOptions = {
  ocr: true,
  ocrLang: 'ara+eng',
  strategy: 'structure',
  chunkSize: 512,
  overlap: 64,
  stripHeaders: true,
  keepLatex: true,
  embedNow: true,
  dedupe: true,
  autoApprove: false,
  threshold: 0.95,
};

export const OPTION_LIMITS = {
  chunkSize: { min: 128, max: 2048 },
  overlap: { min: 0, max: 256 },
  threshold: { min: 0.8, max: 0.99 },
} as const;

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/**
 * بيدمج خيارات جزئية (من طلب أو من JSON محفوظ قديم) مع الافتراضية
 * وبيضبط الحدود. التداخل ما بيتعدى نص حجم المقطع وإلا التقطيع ما بيتقدّم.
 */
export function normalizeOptions(
  input: Partial<IngestionOptions> | null | undefined,
  base: IngestionOptions = DEFAULT_INGESTION_OPTIONS,
): IngestionOptions {
  // حقول الـ DTO غير المرسلة بتوصل كخصائص undefined؛ لو دمجناها كما هي
  // بتمسح القيم المحفوظة (خيارات جزئية بإعادة التقطيع كانت تطفي stripHeaders)
  const defined = Object.fromEntries(
    Object.entries(input ?? {}).filter(([, v]) => v !== undefined),
  ) as Partial<IngestionOptions>;
  const o = { ...base, ...defined };
  const chunkSize = clamp(
    Math.round(Number(o.chunkSize) || base.chunkSize),
    OPTION_LIMITS.chunkSize.min,
    OPTION_LIMITS.chunkSize.max,
  );
  const overlap = clamp(
    Math.round(Number(o.overlap) || 0),
    OPTION_LIMITS.overlap.min,
    Math.min(OPTION_LIMITS.overlap.max, Math.floor(chunkSize / 2)),
  );
  return {
    ocr: Boolean(o.ocr),
    ocrLang: (['ara+eng', 'ara', 'eng'] as const).includes(o.ocrLang)
      ? o.ocrLang
      : base.ocrLang,
    strategy: (['structure', 'semantic', 'fixed'] as const).includes(o.strategy)
      ? o.strategy
      : base.strategy,
    chunkSize,
    overlap,
    stripHeaders: Boolean(o.stripHeaders),
    keepLatex: Boolean(o.keepLatex),
    embedNow: Boolean(o.embedNow),
    dedupe: Boolean(o.dedupe),
    autoApprove: Boolean(o.autoApprove),
    threshold: clamp(
      Number(o.threshold) || base.threshold,
      OPTION_LIMITS.threshold.min,
      OPTION_LIMITS.threshold.max,
    ),
  };
}

/** صفحة نص مستخرجة (بعد الاستخراج وقبل التنظيف) */
export interface ExtractedPage {
  page: number;
  text: string;
  /** مصدر النص: طبقة النص أو التعرّف الضوئي بالنموذج */
  source: 'text' | 'ocr';
}

/** مقطع جاهز للتخزين */
export interface ChunkDraft {
  pageStart: number;
  pageEnd: number;
  section: string | null;
  unit: string | null;
  text: string;
  tokens: number;
}

/** مهام طابور المعالجة */
export const INGESTION_QUEUE = 'knowledge-ingestion';

export type IngestionJobName = 'process' | 'rechunk' | 'embed';

export interface IngestionJobData {
  documentId: string;
}
