import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../../gemini/gemini.service';
import { ContentValidationResult } from '../interfaces/chat.interfaces';

/**
 * Validates that uploaded file content and student messages are relevant
 * to the session's subject. Uses Gemini multimodal analysis for file validation.
 * Acts as the guardrail layer preventing off-topic content processing.
 */
@Injectable()
export class ContentGuardrailService {
  private readonly logger = new Logger(ContentGuardrailService.name);

  constructor(private readonly gemini: GeminiService) {}

  /**
   * Validate whether an uploaded file's content matches the expected subject.
   * Uses Gemini multimodal to detect what subject the file belongs to.
   *
   * @param fileBuffer  Raw file buffer (PDF or image)
   * @param mimeType    Resolved MIME type
   * @param subjectName Expected subject name
   * @param branchName  Academic branch name
   * @returns Validation result with relevance flag and reason
   */
  async validateFileContent(
    fileBuffer: Buffer,
    mimeType: string,
    subjectName: string,
    branchName: string,
  ): Promise<ContentValidationResult> {
    try {
      const responseText = await this.gemini.validateFileContent(
        fileBuffer,
        mimeType,
        subjectName,
        branchName,
      );

      return this.parseValidationResponse(responseText, subjectName);
    } catch (err) {
      this.logger.error(
        `File content validation failed: ${String(err)}. Allowing file to pass.`,
      );
      // Fail-open: if validation itself breaks, allow the file through
      // to avoid blocking legitimate uploads due to AI hiccups
      return {
        isRelevant: true,
        confidence: 0,
        reason: 'لم يتم التحقق من المحتوى - تم قبول الملف مبدئياً',
      };
    }
  }

  /**
   * Parse the raw Gemini validation JSON response.
   */
  private parseValidationResponse(
    responseText: string,
    expectedSubject: string,
  ): ContentValidationResult {
    try {
      const parsed = JSON.parse(responseText);

      const result: ContentValidationResult = {
        isRelevant: Boolean(parsed.isRelevant),
        detectedSubject: parsed.detectedSubject ?? undefined,
        confidence:
          typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
        reason:
          parsed.reason ??
          (parsed.isRelevant
            ? `المحتوى متوافق مع مادة "${expectedSubject}"`
            : `المحتوى غير متوافق مع مادة "${expectedSubject}"`),
      };

      this.logger.log(
        `File validation: relevant=${result.isRelevant}, detected="${result.detectedSubject}", expected="${expectedSubject}", confidence=${result.confidence}`,
      );

      return result;
    } catch (err) {
      this.logger.warn(
        `Failed to parse validation response: ${String(err)}. Raw: ${responseText.slice(0, 300)}`,
      );

      return {
        isRelevant: true,
        confidence: 0,
        reason: 'لم يتم التحقق من المحتوى بشكل صحيح',
      };
    }
  }

  /**
   * Build the off-topic rejection message for the student.
   * Used when an intent is classified as OFF_TOPIC or a file fails validation.
   */
  buildOffTopicResponse(
    subjectName: string,
    reason?: string,
  ): string {
    const base = `عذراً، لا أستطيع الإجابة على هذا السؤال. أنا مساعد متخصص فقط في مادة "${subjectName}" ضمن منهاج التوجيهي الفلسطيني.`;
    const hint = `\n\nيمكنك أن تطلب مني:\n• توليد أسئلة تدريبية في "${subjectName}"\n• رفع ملف امتحان للحصول على أسئلة مشابهة\n• طلب أسئلة حسب الوحدة أو مستوى الصعوبة`;

    return reason ? `${base}\n\nالسبب: ${reason}${hint}` : `${base}${hint}`;
  }

  /**
   * Build the file rejection message when content doesn't match the subject.
   */
  buildFileRejectionResponse(
    subjectName: string,
    detectedSubject?: string,
    reason?: string,
  ): string {
    let msg = `عذراً، محتوى الملف المرفوع غير متوافق مع مادة "${subjectName}".`;
    if (detectedSubject) {
      msg += `\nيبدو أن الملف يحتوي على محتوى يتعلق بـ "${detectedSubject}".`;
    }
    if (reason) {
      msg += `\n${reason}`;
    }
    msg += `\n\nيرجى رفع ملف يحتوي على أسئلة أو محتوى تعليمي خاص بمادة "${subjectName}".`;
    return msg;
  }
}
