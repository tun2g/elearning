import type { SelfAssessment } from '../entities/attempt.entity';

export interface LessonState {
  completionPct: number;
  status: string;
  /** Latest self-assessment per sentence the user has attempted in this lesson. */
  attempts: { sentenceId: string; selfAssessment: SelfAssessment }[];
}
