export const SUPPORTED_EXAM_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export type SupportedExamMimeType = (typeof SUPPORTED_EXAM_MIME_TYPES)[number];

const MIME_MAP: Record<string, SupportedExamMimeType> = {
  'application/pdf': 'application/pdf',
  'application/x-pdf': 'application/pdf',
  'application/acrobat': 'application/pdf',
  'applications/vnd.pdf': 'application/pdf',
  'text/pdf': 'application/pdf',
  'image/jpeg': 'image/jpeg',
  'image/jpg': 'image/jpeg',
  'image/pjpeg': 'image/jpeg',
  'image/jfif': 'image/jpeg',
  'image/png': 'image/png',
  'image/x-png': 'image/png',
  'image/webp': 'image/webp',
  'image/gif': 'image/gif',
};

const EXTENSION_MAP: Record<string, SupportedExamMimeType> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
};

/**
 * Resolves and normalizes the MIME type of an uploaded file.
 * Checks the provided MIME header, filename extension, and file buffer magic bytes.
 * If valid, returns the canonical MIME type and updates `file.mimetype`.
 */
export function resolveExamMimeType(
  file: Express.Multer.File,
): SupportedExamMimeType | null {
  if (!file) return null;

  // 1. Check raw mimetype
  const rawMime = file.mimetype ? file.mimetype.toLowerCase().split(';')[0].trim() : '';
  if (rawMime && MIME_MAP[rawMime]) {
    const canonical = MIME_MAP[rawMime];
    file.mimetype = canonical;
    return canonical;
  }

  // 2. Check filename extension
  if (file.originalname) {
    const ext = file.originalname.toLowerCase().split('.').pop()?.trim();
    if (ext && EXTENSION_MAP[ext]) {
      const canonical = EXTENSION_MAP[ext];
      file.mimetype = canonical;
      return canonical;
    }
  }

  // 3. Inspect buffer magic bytes
  if (file.buffer && file.buffer.length >= 4) {
    const buf = file.buffer;

    // PDF: %PDF (0x25 0x50 0x44 0x46)
    if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) {
      file.mimetype = 'application/pdf';
      return 'application/pdf';
    }

    // PNG: \x89PNG (0x89 0x50 0x4E 0x47)
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
      file.mimetype = 'image/png';
      return 'image/png';
    }

    // JPEG: \xFF\xD8\xFF
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
      file.mimetype = 'image/jpeg';
      return 'image/jpeg';
    }

    // GIF: GIF8 (0x47 0x49 0x46 0x38)
    if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) {
      file.mimetype = 'image/gif';
      return 'image/gif';
    }

    // WEBP: RIFF....WEBP
    if (
      buf.length >= 12 &&
      buf.toString('ascii', 0, 4) === 'RIFF' &&
      buf.toString('ascii', 8, 12) === 'WEBP'
    ) {
      file.mimetype = 'image/webp';
      return 'image/webp';
    }
  }

  return null;
}

/**
 * اسم الملف الأصلي كما كتبه المستخدم. multer (busboy) بيفك اسم الملف
 * بالـ multipart كـ latin1، والمتصفحات بتبعته UTF-8 — فـ«اللغة العربية.pdf»
 * كان يوصل «Ø§ÙÙØºØ©.pdf». منرجّع البايتات ومنفكها UTF-8؛ إذا الناتج مش
 * UTF-8 سليم (اسم latin1 أصلي) منترك الاسم زي ما هو.
 */
export function decodeUploadName(name: string): string {
  if (!/[\u0080-ÿ]/.test(name) || /[^\u0000-ÿ]/.test(name)) return name;
  const decoded = Buffer.from(name, 'latin1').toString('utf8');
  return decoded.includes('�') ? name : decoded;
}
