import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import * as cookie from 'cookie';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

// present = at least one socket open for this user. absent = no sockets open for this user.
@Injectable()
@WebSocketGateway({
  namespace: '/presence',
  cors: { origin: true, credentials: true },
})
export class PresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  @WebSocketServer()
  server!: Server;

  private connections = new Map<number, Set<string>>();

  isUserOnline(userId: number): boolean {
    const sockets = this.connections.get(userId);
    return !!sockets && sockets.size > 0;
  }

  handleConnection(client: Socket) {
    const cookies = client.handshake.headers.cookie;
    const parsed = cookie.parse(cookies || '');
    const jwt = parsed['jwt'];
    if (!jwt) {
      client.disconnect();
      return;
    }
    let userId: number;
    try {
      const payload = this.jwtService.verify(jwt);
      userId = payload.sub;
      client.data.userId = userId;
    } catch {
      client.disconnect();
      return;
    }

    const sockets = this.connections.get(userId) ?? new Set<string>();
    const wasOffline = sockets.size === 0;
    sockets.add(client.id);
    this.connections.set(userId, sockets);

    // First tab opened -> tell everyone this user is now online.
    if (wasOffline) {
      this.server.emit('presence', { userId, isOnline: true });
    }
  }

  async handleDisconnect(client: Socket) {
    const userId: number | undefined = client.data?.userId;
    if (!userId) return;

    const sockets = this.connections.get(userId);
    if (!sockets) return;

    sockets.delete(client.id);
    // No tab left open -> user is offline.
    if (sockets.size === 0) {
      this.connections.delete(userId);
      await this.prisma.user
        .update({ where: { id: userId }, data: { lastSeen: new Date() } })
        .catch(() => {});
      this.server.emit('presence', { userId, isOnline: false });
    }
  }
}
