import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  // save message en bd
  createMessage(senderId: number, receiverId: number, content: string) {
    return this.prisma.message.create({
      data: { senderId, receiverId, content },
    });
  }

  // recup la conversation 
  getConversation(meId: number, friendId: number) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: meId, receiverId: friendId },
          { senderId: friendId, receiverId: meId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
