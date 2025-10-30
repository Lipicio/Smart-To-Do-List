import { MaxLength, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @MaxLength(150, { message: 'O Título não pode conter mais que 150 caracteres.' })
  title?: string;

  @IsOptional()
  @IsBoolean({ message: 'isCompleted deve ser true/false' })
  isCompleted?: boolean;
  
}
