import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from 'app.module';
import { AppService } from 'app.service';
import { REQUEST_ENTITY_SIZE_LIMIT } from 'common/constants/app';
import { HttpExceptionFilter } from 'common/exception-filters/http-exception.filter';
import { ValidationException } from 'common/exceptions/validation.exception';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import type { Env } from 'environment/environment.type';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  const appService = app.get(AppService);
  const projectName = await appService.getProjectName();
  const configService = app.get(ConfigService<Env, true>);
  const port = configService.get('PORT', { infer: true });

  const isDevelopment = configService.get('isDevelopment', { infer: true });
  const isStaging = configService.get('isStaging', { infer: true });
  const isProduction = configService.get('isProduction', { infer: true });

  if (isDevelopment) {
    app.enableCors({
      origin: /^.*$/,
      credentials: true,
    });
  } else if (isStaging) {
    app.enableCors({
      origin: /^http:\/\/localhost(:\d+)?$/,
      credentials: true,
    });
  } else if (isProduction) {
    const frontendUrl = configService.get('FRONTEND_URL', { infer: true });

    app.enableCors({
      origin: frontendUrl,
      credentials: true,
    });
  }

  app.setGlobalPrefix('api');
  app.useBodyParser('json', { limit: REQUEST_ENTITY_SIZE_LIMIT });
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      validateCustomDecorators: false,
      exceptionFactory: (errors): ValidationException =>
        new ValidationException(errors),
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerPath = 'docs';
  const swaggerConfig = new DocumentBuilder()
    .setTitle(`${projectName} API Documentation`)
    .setDescription(
      'A package that generates typescript interfaces and api client based on swagger documentation: ' +
        '<a href="https://www.npmjs.com/package/swagger-typescript-api" target="_blank">swagger-typescript-api</a>. ' +
        `JSON schema can be found <a href="/${swaggerPath}-json" target="_blank">here</a>.`,
    )
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(swaggerPath, app, document);

  app.use(helmet());

  await app.listen(port);
}
void bootstrap();
