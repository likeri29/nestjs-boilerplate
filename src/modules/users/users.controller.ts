import { Controller, Get, NotFoundException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { User } from 'database/entities/user.entity';
import { CurrentUser } from 'modules/auth/decorators/current-user.decorator';
import type { AuthUser } from 'modules/auth/types/auth-user.type';
import { UsersService } from 'modules/users/users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() authUser: AuthUser): Promise<User> {
    const user = await this.usersService.findById(authUser.id);

    if (!user) throw new NotFoundException('User not found');

    return user;
  }
}
