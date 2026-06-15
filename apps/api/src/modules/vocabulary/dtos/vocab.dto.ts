import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsBoolean, IsEnum, IsString } from 'class-validator';

export class VocabAttemptDto {
  @ApiProperty() @IsString() vocabId!: string;
  @ApiProperty() @IsBoolean() correct!: boolean;
  @ApiProperty({ enum: ['again', 'hard', 'easy'] })
  @IsEnum(['again', 'hard', 'easy'])
  assessment!: 'again' | 'hard' | 'easy';
}

export class SeedReviewDto {
  /** Words the learner struggled with — those matching the vocab catalog become due for review. */
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  words!: string[];
}
