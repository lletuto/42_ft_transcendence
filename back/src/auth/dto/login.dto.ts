import { IsEmail , IsNotEmpty, Length} from 'class-validator';

export class LoginDto{
	@IsNotEmpty()
	email_nickname!: string;

	@IsNotEmpty()
	@Length(8, 15)
	password!: string;

}