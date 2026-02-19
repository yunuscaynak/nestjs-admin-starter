import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  // DTO üzerindeki class-validator kurallarını global olarak aktif eder.
  app.useGlobalPipes(
    new ValidationPipe({
      // DTO'da olmayan alanları otomatik atar (güvenlik + temiz payload).
      whitelist: true,
      // Bilinmeyen alan gelirse isteği reddeder; API sözleşmesini korur.
      forbidNonWhitelisted: true,
      // Tip dönüşümleri için class-transformer entegrasyonunu açar.
      transform: true,
    }),
  );

  // Swagger/OpenAPI dokümanı için temel meta bilgiler.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nest CRUD API')
    .setDescription(
      'NestJS + Prisma ile yazılmış kullanıcı CRUD endpoint dokümantasyonu.',
    )
    .setVersion('1.0.0')
    .addTag('users', 'Kullanıcı CRUD işlemleri')
    .build();

  // Uygulamadaki controller/DTO bilgilerini okuyup OpenAPI JSON üretir.
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig, {
    // SDK/codegen tarafında daha stabil method isimleri üretir.
    operationIdFactory: (_controllerKey: string, methodKey: string) =>
      methodKey,
  });

  // Swagger UI'ı /docs altında yayınlar.
  SwaggerModule.setup('docs', app, swaggerDocument, {
    customSiteTitle: 'Nest CRUD API Docs',
    swaggerOptions: {
      // Sayfa yenilense de UI üzerindeki yetki/ayarları korur.
      persistAuthorization: true,
      // Uzun süren endpointleri UI'da görünür hale getirir.
      displayRequestDuration: true,
      // İlk yüklemede endpoint listesi sade kalsın.
      docExpansion: 'none',
      // Endpoint araması için filtre alanını açar.
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
