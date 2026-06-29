import { IsEmail, IsOptional, Length } from 'class-validator';

// Tous les champs optionnels : utilise par PATCH /users/:id
// (changement de pseudo, mot de passe et/ou email depuis la page profile).
// (Meme que RegisterDto)
export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Length(8, 15)
  password?: string;

  @IsOptional()
  @Length(2, 15)
  nickname?: string;
}
