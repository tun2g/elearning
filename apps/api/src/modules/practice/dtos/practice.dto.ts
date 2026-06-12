import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import type { PracticeMode, SelfAssessment } from '../entities/attempt.entity';

export class CreateAttemptDto {
  @ApiProperty() @IsString() sentenceId!: string;
  @ApiProperty({ enum: ['listen', 'shadow', 'voice'] }) @IsEnum(['listen', 'shadow', 'voice']) mode!: PracticeMode;
  @ApiProperty({ enum: ['again', 'hard', 'easy'] }) @IsEnum(['again', 'hard', 'easy']) selfAssessment!: SelfAssessment;
  @ApiProperty({ required: false }) @IsString() @IsOptional() recordingUrl?: string;
}
