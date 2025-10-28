import { MaxLength, IsOptional } from 'class-validator';

export class UpdateTaskDto {  
  @IsOptional()
  @MaxLength(150, { message: 'O Título não pode conter mais que 150 caracteres.' })
  title?: string;
  
  @IsOptional()
  isCompleted?: boolean;
}