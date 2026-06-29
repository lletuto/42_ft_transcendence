import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import * as cookie from 'cookie';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

const MAX_MESSAGE_LENGTH = 1000;

@Injectable()
@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: true, credentials: true },
})
export class ChatGateway implements OnGatewayConnection {
  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
  ) {}

  @WebSocketServer()
  server!: Server;

  // uthentifie cookie jwt
  handleConnection(client: Socket) {
    const cookies = client.handshake.headers.cookie;
    const parsed = cookie.parse(cookies || '');
    const jwt = parsed['jwt'];
    if (!jwt) {
      client.disconnect();
      return;
    }
    try {
      const payload = this.jwtService.verify(jwt);
      client.data.userId = payload.sub;
      client.join('user:' + payload.sub);
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('sendMessage')
  async onSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: number; content: string },
  ) {
    const senderId: number | undefined = client.data?.userId;
    if (!senderId || !data?.receiverId || !data?.content?.trim()) return;

    const content = data.content.trim().slice(0, MAX_MESSAGE_LENGTH);

    const message = await this.chatService.createMessage(
      senderId,
      Number(data.receiverId),
      content,
    );

    this.server.to('user:' + message.receiverId).emit('newMessage', message);
    this.server.to('user:' + message.senderId).emit('newMessage', message);
  }
}
