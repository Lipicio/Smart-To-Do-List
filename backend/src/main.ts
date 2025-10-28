import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((err) => ({
          field: err.property,
          message:
            Object.values(err.constraints ?? {})[0] ||
            'Campo inválido ou ausente',
        }));

        return new BadRequestException({
          statusCode: 400,
          message: 'Erro de validação',
          errors: formattedErrors,
        });

      },
    }),
  );

  await app.listen(3001);
}

bootstrap();
