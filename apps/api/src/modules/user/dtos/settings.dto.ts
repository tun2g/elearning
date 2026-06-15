import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { UserSettings } from '@elearning/contracts';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min, ValidateIf } from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  dailyGoalSentences?: number;

  @ApiPropertyOptional({ nullable: true, description: 'Expo push token; null to clear.' })
  @IsOptional()
  @ValidateIf((o: UpdateSettingsDto) => o.pushToken !== null)
  @IsString()
  pushToken?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notificationEnabled?: boolean;

  @ApiPropertyOptional({ minimum: 0, maximum: 23 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  reminderHour?: number;

  @ApiPropertyOptional({ example: 'Asia/Ho_Chi_Minh' })
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class UserSettingsResponseDto implements UserSettings {
  @ApiProperty() dailyGoalSentences!: number;
  @ApiProperty({ nullable: true }) pushToken!: string | null;
  @ApiProperty() notificationEnabled!: boolean;
  @ApiProperty() reminderHour!: number;
  @ApiProperty() timezone!: string;
}
