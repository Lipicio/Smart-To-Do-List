import { IsNotEmpty, MaxLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty({ message: 'O Título é obrigatório' })
  @MaxLength(150, { message: 'O Título não pode conter mais que 150 caracteres.' })
  title!: string;

  @IsOptional()
  @IsBoolean({ message: 'isCompleted deve ser true/false' })
  isCompleted?: boolean;
}
