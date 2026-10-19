import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AppValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  const frontendUrl =
    configService.get<string>('frontendUrl') ||
    configService.get<string>('FRONTEND_URL') ||
    'http://localhost:5173';

  app.enableCors({
    origin: [
      frontendUrl,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useGlobalPipes(new AppValidationPipe());

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalInterceptors(new LoggingInterceptor());

  const port =
    configService.get<number>('port') ||
    configService.get<number>('PORT') ||
    3000;

  await app.listen(port);

  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`📡 API base URL: http://localhost:${port}/api`);
}

void bootstrap();
