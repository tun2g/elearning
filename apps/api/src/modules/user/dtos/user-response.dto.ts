import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() email!: string;
  @ApiProperty() displayName!: string;
  @ApiProperty({ nullable: true }) avatarUrl!: string | null;
  @ApiProperty() xpTotal!: number;
  @ApiProperty() levelRank!: string;
  @ApiProperty() emailVerified!: boolean;
  @ApiProperty({ description: 'Whether a password is set (false for Google/passwordless-only)' })
  hasPassword!: boolean;
  @ApiProperty() createdAt!: Date;
}
