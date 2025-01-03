import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.enableCors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST","PATCH","DELETE"],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:true
    })
  )

  await app.listen(5000);
}
bootstrap();
