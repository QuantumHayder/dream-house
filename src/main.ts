import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // allows only attributes defined in the dto
      forbidNonWhitelisted: true, // throws 400 when attributes not defined in the dto are sent
      transform: true, // transforms request objects to the defined dto
      transformOptions: {
        enableImplicitConversion: true, // Convert types automatically (e.g., string to number)
      },
    }),
  );
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
