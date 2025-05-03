import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionsFilter } from './utils/global.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { MulterModule } from '@nestjs/platform-express'; // Don't use it in main.ts as middleware

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new GlobalExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('/api/v1');
  app.enableCors({
    origin: 'http://45.80.158.70',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Course API')
    .setDescription('API for managing courses')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(5000);
}

bootstrap();
