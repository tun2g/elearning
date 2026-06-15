import { UserEntity } from '../entities/user.entity';
import { UserResponseDto } from './user-response.dto';

/** Maps a user entity to the public response shape — never leaks passwordHash/googleId. */
export function toUserResponse(user: UserEntity): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    xpTotal: user.xpTotal,
    levelRank: user.levelRank,
    emailVerified: user.emailVerifiedAt !== null,
    hasPassword: user.passwordHash !== null,
    createdAt: user.createdAt,
  };
}
