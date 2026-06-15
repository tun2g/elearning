import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UpdateSettingsDto } from './dtos/settings.dto';
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

  async findByGoogleId(googleId: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { googleId } });
  }

  async create(data: {
    email: string;
    passwordHash?: string | null;
    displayName: string;
    emailVerifiedAt?: Date | null;
    googleId?: string | null;
    avatarUrl?: string | null;
  }): Promise<UserEntity> {
    const user = this.userRepo.create({
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash ?? null,
      displayName: data.displayName,
      emailVerifiedAt: data.emailVerifiedAt ?? null,
      googleId: data.googleId ?? null,
      avatarUrl: data.avatarUrl ?? null,
    });
    const saved = await this.userRepo.save(user);

    const settings = this.settingsRepo.create({ user: saved });
    await this.settingsRepo.save(settings);

    return saved;
  }

  /** Persists field changes on an existing user (verification, Google link, etc.). */
  async update(user: UserEntity): Promise<UserEntity> {
    return this.userRepo.save(user);
  }

  async findByIdOrThrow(id: string): Promise<UserEntity> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getSettings(userId: string): Promise<UserSettingsEntity> {
    let settings = await this.settingsRepo.findOne({ where: { user: { id: userId } } });
    if (!settings) {
      settings = await this.settingsRepo.save(this.settingsRepo.create({ user: { id: userId } }));
    }
    return settings;
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto): Promise<UserSettingsEntity> {
    const settings = await this.getSettings(userId);
    if (dto.dailyGoalSentences !== undefined) settings.dailyGoalSentences = dto.dailyGoalSentences;
    if (dto.pushToken !== undefined) settings.pushToken = dto.pushToken;
    if (dto.notificationEnabled !== undefined) settings.notificationEnabled = dto.notificationEnabled;
    if (dto.reminderHour !== undefined) settings.reminderHour = dto.reminderHour;
    if (dto.timezone !== undefined) settings.timezone = dto.timezone;
    return this.settingsRepo.save(settings);
  }
}
