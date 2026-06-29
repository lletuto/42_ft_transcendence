import { IsNotEmpty } from "class-validator";

export class uriDto
{
    @IsNotEmpty()
    token!: string;
}