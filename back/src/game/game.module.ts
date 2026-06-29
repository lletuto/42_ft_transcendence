import { Module } from '@nestjs/common';
import {GameGateway } from './game.gateway'
import { JwtModule } from '@nestjs/jwt'

import { GameService } from './game.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule, JwtModule.register({secret: process.env.JWT_SECRET})],
  providers: [GameService, GameGateway],
})
export class GameModule {}