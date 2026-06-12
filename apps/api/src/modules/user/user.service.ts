import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserSettingsEntity } from './entities/user-settings.entity';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(UserSettingsEntity)
    private readonly settingsRepo: Repository<UserSettingsEntity>
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { email: email.toLowerCase() } });
  }

  async create(data: { email: string; passwordHash: string; displayName: string }): Promise<UserEntity> {
    const user = this.userRepo.create({
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      displayName: data.displayName,
    });
    const saved = await this.userRepo.save(user);

    const settings = this.settingsRepo.create({ user: saved });
    await this.settingsRepo.save(settings);

    return saved;
  }

  async findByIdOrThrow(id: string): Promise<UserEntity> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
