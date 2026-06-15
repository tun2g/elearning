import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import type { PracticeMode, SelfAssessment } from '../entities/attempt.entity';

export class CreateAttemptDto {
  @ApiProperty() @IsString() sentenceId!: string;
  @ApiProperty({ enum: ['listen', 'shadow', 'voice'] }) @IsEnum(['listen', 'shadow', 'voice']) mode!: PracticeMode;
  @ApiProperty({ enum: ['again', 'hard', 'easy'] }) @IsEnum(['again', 'hard', 'easy']) selfAssessment!: SelfAssessment;
  @ApiProperty({ required: false }) @IsString() @IsOptional() recordingUrl?: string;
}

export class VoiceAttemptDto {
  @ApiProperty() @IsString() sentenceId!: string;
  /** Base64-encoded recording. Analyzed transiently and never stored. */
  @ApiProperty() @IsString() audioBase64!: string;
  @ApiProperty() @IsString() mimeType!: string;
}

export class VoiceEvaluateDto {
  /** The attempt created by the transcribe step, updated in place with the score. */
  @ApiProperty() @IsString() attemptId!: string;
  @ApiProperty() @IsString() sentenceId!: string;
  /** Base64-encoded recording, re-sent for scoring. Analyzed transiently and never stored. */
  @ApiProperty() @IsString() audioBase64!: string;
  @ApiProperty() @IsString() mimeType!: string;
}
