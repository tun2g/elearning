import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { RequestUser } from 'src/shared/modules/http-request-context/interfaces/request-user.interface';

import { UserResponseDto } from './dtos/user-response.dto';
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
}
