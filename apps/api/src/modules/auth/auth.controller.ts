import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Ip, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { UserService } from 'src/modules/user/user.service';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { Public } from 'src/shared/decorators/public.decorator';
import { RequestUser } from 'src/shared/modules/http-request-context/interfaces/request-user.interface';

import { AuthService } from './auth.service';
import { AuthTokensResponseDto, LoginDto, RefreshDto, RegisterDto } from './dtos/auth.dto';
import type { SessionContext } from './interfaces/session-context.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register a new account' })
  register(
    @Body() dto: RegisterDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string
  ): Promise<AuthTokensResponseDto> {
    return this.authService.register(dto.email, dto.password, dto.displayName, ctx(ip, userAgent));
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and start a session' })
  login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string
  ): Promise<AuthTokensResponseDto> {
    return this.authService.login(dto.email, dto.password, ctx(ip, userAgent));
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate the refresh token within the session' })
  refresh(
    @Body() dto: RefreshDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string
  ): Promise<AuthTokensResponseDto> {
    return this.authService.refresh(dto.refreshToken, ctx(ip, userAgent));
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke the current session' })
  async logout(@Body() dto: RefreshDto): Promise<void> {
    await this.authService.logout(dto.refreshToken);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke every session for the current user' })
  async logoutAll(@CurrentUser() user: RequestUser): Promise<void> {
    await this.authService.logoutAll(user.id);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get the current user' })
  async me(@CurrentUser() currentUser: RequestUser) {
    return this.userService.findByIdOrThrow(currentUser.id);
  }
}

function ctx(ip: string, userAgent?: string): SessionContext {
  return { ipAddress: ip ?? null, userAgent: userAgent ?? null };
}
