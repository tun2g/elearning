import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { RequestUser } from 'src/shared/modules/http-request-context/interfaces/request-user.interface';

import { UpdateSettingsDto, UserSettingsResponseDto } from './dtos/settings.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { UserSettingsEntity } from './entities/user-settings.entity';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('me')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser() currentUser: RequestUser): Promise<UserResponseDto> {
    const user = await this.userService.findByIdOrThrow(currentUser.id);
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      xpTotal: user.xpTotal,
      levelRank: user.levelRank,
      createdAt: user.createdAt,
    };
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get current user settings' })
  async getSettings(@CurrentUser() currentUser: RequestUser): Promise<UserSettingsResponseDto> {
    return this.toSettingsResponse(await this.userService.getSettings(currentUser.id));
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update current user settings (push token, notifications, goal)' })
  async updateSettings(
    @CurrentUser() currentUser: RequestUser,
    @Body() dto: UpdateSettingsDto
  ): Promise<UserSettingsResponseDto> {
    return this.toSettingsResponse(await this.userService.updateSettings(currentUser.id, dto));
  }

  private toSettingsResponse(settings: UserSettingsEntity): UserSettingsResponseDto {
    return {
      dailyGoalSentences: settings.dailyGoalSentences,
      pushToken: settings.pushToken,
      notificationEnabled: settings.notificationEnabled,
      reminderHour: settings.reminderHour,
      timezone: settings.timezone,
    };
  }
}
