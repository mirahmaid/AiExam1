import type {
  BloomTaxonomyLevel,
  DifficultyLevel,
  GeneratedQuestionSourceType,
} from './enums';

export interface Choice {
  label: string;
  text: string;
}

export interface GeneratedQuestion {
  id: string;
  questionText: string;
  choices: Choice[];
  correctAnswer: string;
  explanation: string;
  bloomTaxonomy: BloomTaxonomyLevel | null;
  difficulty: DifficultyLevel | null;
  sourceType: GeneratedQuestionSourceType;
  subjectId: string;
  topicId: string | null;
  /**
   * Provenance of the bank questions this one was grounded on.
   * The previous frontend copy of this interface omitted the field entirely.
   */
  referenceMetadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface GenerateQuestionsRequest {
  subjectId: string;
  count?: number;
  difficulty?: DifficultyLevel;
  bloomTaxonomy?: BloomTaxonomyLevel;
  topicId?: string;
}

export interface GenerateQuestionsResponse {
  success: boolean;
  count: number;
  sourceType: GeneratedQuestionSourceType;
  questions: GeneratedQuestion[];
}

export interface Quota {
  quotaLimit: number;
  used: number;
  remaining: number;
  resetAt: string;
}
