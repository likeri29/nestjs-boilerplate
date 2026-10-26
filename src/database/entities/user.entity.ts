import { Expose } from 'class-transformer';
import { Column, Entity } from 'typeorm';

import { BaseEntity } from 'database/entities/base.entity';

@Entity('users')
export class User extends BaseEntity {
  @Expose()
  @Column({ type: 'varchar', length: 320, unique: true })
  email: string;

  @Expose()
  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;
}
