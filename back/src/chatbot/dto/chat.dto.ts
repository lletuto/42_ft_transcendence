import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ChatDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(2000)
	message!: string;
}
