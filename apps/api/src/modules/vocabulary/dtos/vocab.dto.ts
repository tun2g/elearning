import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsString } from 'class-validator';

export class VocabAttemptDto {
  @ApiProperty() @IsString() vocabId!: string;
  @ApiProperty() @IsBoolean() correct!: boolean;
  @ApiProperty({ enum: ['again', 'hard', 'easy'] })
  @IsEnum(['again', 'hard', 'easy'])
  assessment!: 'again' | 'hard' | 'easy';
}
