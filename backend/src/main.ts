import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import type { Express, NextFunction, Request, Response } from 'express';
import { loadEnvFile } from 'node:process';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { SanitizeInputPipe } from './common/pipes/sanitize-input.pipe';
import { getCorsOrigins } from './common/utils/cors.util';

loadEnvFile?.();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigins = getCorsOrigins();
  const isProduction = process.env.NODE_ENV === 'production';
  const expressApp = app.getHttpAdapter().getInstance() as Express;

  expressApp.set('trust proxy', 1);

  app.use((_request: Request, response: Response, next: NextFunction) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('X-DNS-Prefetch-Control', 'off');
    response.setHeader('X-Download-Options', 'noopen');
    response.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    response.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    response.setHeader('Origin-Agent-Cluster', '?1');

    if (isProduction) {
      response.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains',
      );
    }

    next();
  });

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(
        new Error(
          `CORS origin denied. Allowed origins: ${corsOrigins.join(', ')}`,
        ),
      );
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'Retry-After',
    ],
  } satisfies CorsOptions);
  app.setGlobalPrefix('api');

  // DTO üzerindeki class-validator kurallarını global olarak aktif eder.
  app.useGlobalPipes(
    new SanitizeInputPipe(),
    new ValidationPipe({
      // DTO'da olmayan alanları otomatik atar (güvenlik + temiz payload).
      whitelist: true,
      // Bilinmeyen alan gelirse isteği reddeder; API sözleşmesini korur.
      forbidNonWhitelisted: true,
      // Tip dönüşümleri için class-transformer entegrasyonunu açar.
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (validationErrors) =>
        new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Gonderilen veri dogrulanamadi.',
          errors: validationErrors.flatMap((validationError) =>
            Object.values(validationError.constraints ?? {}),
          ),
        }),
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());

  // Swagger/OpenAPI dokümanı için temel meta bilgiler.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nest CRUD API')
    .setDescription(
      'NestJS + Prisma ile yazilmis auth ve kullanici yonetimi endpoint dokumantasyonu.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Authorization: Bearer <token>',
      },
      'bearer',
    )
    .addTag('auth', 'Kimlik dogrulama islemleri')
    .addTag('posts', 'Post CRUD islemleri')
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

  await app.listen(process.env.PORT ?? 3002);
}
void bootstrap();
