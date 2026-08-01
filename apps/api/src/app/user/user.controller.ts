import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { UserEntity } from '@org/dal';
import type { UserSummary } from '@org/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserService } from './user.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search and discovery users for starting direct messages',
    description: 'Returns up to 20 users matching search query, excluding current user.',
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiResponse({ status: 200, description: 'User items returned successfully' })
  async getUsers(
    @CurrentUser() currentUser: UserEntity,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ): Promise<{ items: UserSummary[]; nextCursor?: string; hasMore: boolean }> {
    return this.userService.searchUsers(currentUser, search, limit, cursor);
  }
}
