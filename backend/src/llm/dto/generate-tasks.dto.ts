import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class GenerateTasksDto {
  @IsNotEmpty({ message: 'O script é obrigatório' })
  @IsString()
  @MaxLength(5000, { message: 'Script muito grande' })
  script!: string;

  @IsNotEmpty({ message: 'O token do OpenRouter é obrigatório' })
  @IsString()
  openRouterToken!: string;

}
