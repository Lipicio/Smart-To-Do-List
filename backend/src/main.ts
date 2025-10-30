import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove propriedades não declaradas nos DTOs
      forbidNonWhitelisted: true, // rejeita requests com props extras
      transform: true, // transforma payloads para instâncias de classes (DTOs)
      transformOptions: { enableImplicitConversion: true },
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

  const port = Number(process.env.PORT || 3001);
  await app.listen(port);
}

bootstrap();
