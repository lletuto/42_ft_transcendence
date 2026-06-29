import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ChatService } from './chat.service';
import { GuardJwt } from '../auth/guards/jwt.guards';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':friendId')
  @UseGuards(GuardJwt)
  conversation(
    @Param('friendId', ParseIntPipe) friendId: number,
    @Req() req: Request,
  ) {
    const meId = req.user!.sub;
    return this.chatService.getConversation(meId, friendId);
  }
}
