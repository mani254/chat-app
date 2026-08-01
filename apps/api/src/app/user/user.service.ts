import { Injectable } from '@nestjs/common';
import type { UserEntity } from '@org/dal';
import { UserRepository } from '@org/dal';
import type { UserSummary } from '@org/shared';

function toUserSummary(user: UserEntity): UserSummary {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar ?? undefined,
    color: user.color ?? undefined,
    isOnline: user.isOnline ?? false,
  };
}

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async searchUsers(
    currentUser: UserEntity,
    search?: string,
    limitStr?: string,
    cursor?: string,
  ): Promise<{ items: UserSummary[]; nextCursor?: string; hasMore: boolean }> {
    const limit = limitStr ? parseInt(limitStr, 10) : 10;
    const { items, nextCursor, hasMore } =
      await this.userRepository.searchUsersWithCursor({
        search,
        excludeUserId: currentUser._id,
        limit,
        cursor,
      });

    return {
      items: items.map(toUserSummary),
      nextCursor,
      hasMore,
    };
  }
}
