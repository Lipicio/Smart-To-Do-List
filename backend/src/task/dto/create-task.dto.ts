import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty({ message: 'O Título é obrigatório' })
  title!: string;
}