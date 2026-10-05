import { resolveExamMimeType } from './file-type.util';
import { decodeUploadName } from './file-type.util';

describe('file-type.util', () => {
  it('should resolve canonical PDF from standard mimetype', () => {
    const file = {
      mimetype: 'application/pdf',
      originalname: 'test.pdf',
      buffer: Buffer.from('test'),
    } as Express.Multer.File;

    expect(resolveExamMimeType(file)).toBe('application/pdf');
    expect(file.mimetype).toBe('application/pdf');
  });

  it('should resolve PDF from variant mimetype and parameters', () => {
    const file = {
      mimetype: 'application/x-pdf; charset=utf-8',
      originalname: 'test.bin',
      buffer: Buffer.from('test'),
    } as Express.Multer.File;

    expect(resolveExamMimeType(file)).toBe('application/pdf');
    expect(file.mimetype).toBe('application/pdf');
  });

  it('should resolve PDF from extension when mimetype is application/octet-stream', () => {
    const file = {
      mimetype: 'application/octet-stream',
      originalname: 'calculus_2025.PDF',
      buffer: Buffer.from('test'),
    } as Express.Multer.File;

    expect(resolveExamMimeType(file)).toBe('application/pdf');
    expect(file.mimetype).toBe('application/pdf');
  });

  it('should resolve PDF from buffer magic bytes (%PDF)', () => {
    const file = {
      mimetype: 'application/octet-stream',
      originalname: 'unknown_file',
      buffer: Buffer.from('%PDF-1.4 header data'),
    } as Express.Multer.File;

    expect(resolveExamMimeType(file)).toBe('application/pdf');
    expect(file.mimetype).toBe('application/pdf');
  });

  it('should resolve image formats from mimetype, extension, and magic bytes', () => {
    // PNG
    const pngFile = {
      mimetype: 'image/png',
      originalname: 'exam.png',
      buffer: Buffer.from('png data'),
    } as Express.Multer.File;
    expect(resolveExamMimeType(pngFile)).toBe('image/png');

    // JPEG via jpg extension and octet-stream
    const jpgFile = {
      mimetype: 'application/octet-stream',
      originalname: 'exam.jpg',
      buffer: Buffer.from('jpg data'),
    } as Express.Multer.File;
    expect(resolveExamMimeType(jpgFile)).toBe('image/jpeg');
    expect(jpgFile.mimetype).toBe('image/jpeg');

    // PNG via magic bytes
    const pngMagic = {
      mimetype: 'application/octet-stream',
      originalname: 'file_without_ext',
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    } as Express.Multer.File;
    expect(resolveExamMimeType(pngMagic)).toBe('image/png');
  });

  it('should return null for unsupported file types', () => {
    const zipFile = {
      mimetype: 'application/zip',
      originalname: 'archive.zip',
      buffer: Buffer.from('PK\x03\x04'),
    } as Express.Multer.File;
    expect(resolveExamMimeType(zipFile)).toBeNull();

    const txtFile = {
      mimetype: 'text/plain',
      originalname: 'notes.txt',
      buffer: Buffer.from('hello world'),
    } as Express.Multer.File;
    expect(resolveExamMimeType(txtFile)).toBeNull();
  });
});

describe('decodeUploadName', () => {
  const asMulter = (s: string) => Buffer.from(s, 'utf8').toString('latin1');

  it('recovers UTF-8 names that multer decoded as latin1', () => {
    expect(decodeUploadName(asMulter('اللغة العربية - الكتاب الأول.pdf'))).toBe('اللغة العربية - الكتاب الأول.pdf');
  });

  it('leaves plain ASCII and genuine latin1 names alone', () => {
    expect(decodeUploadName('exam_2025.pdf')).toBe('exam_2025.pdf');
    expect(decodeUploadName('café.pdf')).toBe('café.pdf');
  });

  it('leaves names that are already proper Unicode alone', () => {
    expect(decodeUploadName('كيمياء.pdf')).toBe('كيمياء.pdf');
  });
});
