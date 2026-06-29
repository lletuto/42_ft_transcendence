import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatbotController } from './chatbot.controller';
import { RagService } from './rag.service';
import { PrismaService } from '../prisma/prisma.service';
import { GuardJwt } from '../auth/guards/jwt.guards';

// ChatbotModule is a NestJS module that encapsulates the chatbot functionality. It imports the JwtModule for authentication, declares the ChatbotController to handle incoming requests, and provides the RagService for processing chat messages, PrismaService for database interactions, and GuardJwt for securing the endpoints.
@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET })],
  controllers: [ChatbotController],
  providers: [RagService, PrismaService, GuardJwt],
})
export class ChatbotModule {}