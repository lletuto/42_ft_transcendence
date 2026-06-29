import { IsEmail , IsNotEmpty, Length} from 'class-validator';

export class RegisterDto{
	@IsEmail()
	email!: string;

	@IsNotEmpty()
	@Length(8, 15)
	password!: string;

	@IsNotEmpty()
	@Length(2, 15)
	nickname!: string;

}