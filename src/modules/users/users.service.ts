import { Injectable } from '@nestjs/common';

import { User } from 'database/entities/user.entity';

@Injectable()
export class UsersService {
  async findById(id: string): Promise<User | null> {
    return User.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return User.findOneBy({ email: this.normalizeEmail(email) });
  }

  async create(email: string): Promise<User> {
    return User.create({ email: this.normalizeEmail(email) }).save();
  }

  async findOrCreateByEmail(email: string): Promise<User> {
    return (await this.findByEmail(email)) ?? this.create(email);
  }

  async markEmailAsVerified(user: User): Promise<User> {
    user.isEmailVerified = true;

    return user.save();
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
