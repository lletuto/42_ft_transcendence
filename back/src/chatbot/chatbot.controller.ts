import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { RagService } from './rag.service';
import { GuardJwt } from '../auth/guards/jwt.guards';
import { ChatDto } from './dto/chat.dto';

// ChatbotController handles incoming chat requests to the /chatbot endpoint. It uses the RagService to process the user's message and generate a response. The endpoint is protected by the GuardJwt to ensure that only authenticated users can access it.
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly ragService: RagService) {}

  @UseGuards(GuardJwt)
  @Post()
  async chat(@Body() body: ChatDto) {
    const response = await this.ragService.query(body.message);
    return { response };
  }
}
