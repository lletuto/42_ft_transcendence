import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PresenceGateway } from './presence.gateway';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly presence: PresenceGateway,
  ) {}

  private strip(user: { password?: string; refreshToken?: string | null } | null) {
    if (!user) return user;
    const { password, refreshToken, ...rest } = user;
    return rest;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({ orderBy: { id: 'asc' } });
    return users.map((u) => this.strip(u));
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return user;
    const isOnline = this.presence.isUserOnline(user.id);
    return { ...this.strip(user), isOnline };
  }

  async update(id: number, dto: UpdateUserDto) {
    const data: UpdateUserDto = { ...dto };
    // Re-hash bcrypt si un new mdp
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    try {
      const user = await this.prisma.user.update({ where: { id }, data });
      return this.strip(user);
    } catch {
      // email/nickname sont uniques (comme dans auth.service).
      throw new ConflictException('Email/nickname already used');
    }
  }

  async setAvatar(id: number, filename: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { avatar: filename },
    });
    return this.strip(user);
  }

  async searchByNickname(currentUserId: number, q: string) {
    const term = q.trim();
    if (!term) return [];
    return this.prisma.user.findMany({
      where: {
        nickname: { contains: term, mode: 'insensitive' },
        id: { not: currentUserId },
        // Pas dans les amis : aucune ligne Friendship(userId=currentUserId, friendId=ce user)
        NOT: { friendOf: { some: { userId: currentUserId } } },
      },
      take: 10,
      orderBy: { nickname: 'asc' },
      select: { id: true, nickname: true, email: true, avatar: true },
    });
  }

  async getFriends(userId: number) {
    const rows = await this.prisma.friendship.findMany({
      where: { userId },
      include: { friend: true },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => {
      const { password, refreshToken, ...rest } = r.friend;
      const isOnline = this.presence.isUserOnline(r.friend.id);
      return { ...rest, isOnline };
    });
  }

  async addFriend(userId: number, friendId: number) {
    if (userId === friendId) {
      throw new BadRequestException('Tu ne peux pas être ami avec toi-même.');
    }
    const friend = await this.prisma.user.findUnique({ where: { id: friendId } });
    if (!friend) {
      throw new NotFoundException('Utilisateur introuvable.');
    }
    await this.prisma.friendship.createMany({
      data: [
        { userId, friendId },
        { userId: friendId, friendId: userId },
      ],
      skipDuplicates: true,
    });
    return this.getFriends(userId);
  }

  async removeFriend(userId: number, friendId: number) {
    await this.prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });
    return this.getFriends(userId);
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
