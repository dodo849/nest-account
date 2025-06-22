import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapterHost));

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Nest Account API')
    .setDescription('NestJS 계정 관리 API 문서')
    .setVersion('1.0')
    .addTag('auth', '인증 관련 API')
    .addTag('users', '사용자 관리 API')
    .addBearerAuth() // JWT 인증을 위한 Bearer Token 설정
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 새로고침해도 토큰 유지
    },
  });

  await app.listen(process.env.PORT ?? 3000);

  console.log(
    `-- Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(
    `-- Swagger UI: http://localhost:${process.env.PORT ?? 3000}/api`,
  );
}
bootstrap();
