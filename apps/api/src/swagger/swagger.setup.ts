import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * configureSwagger
 *
 * Sets up OpenAPI / Swagger at GET /api/docs.
 *
 * Features:
 *  - Bearer JWT auth support (future-ready)
 *  - DTO classes annotated with @ApiProperty() appear automatically
 *  - Disabled in production via NODE_ENV guard
 */
export function configureSwagger(app: INestApplication): void {
  if (process.env['NODE_ENV'] === 'production') return;

  const config = new DocumentBuilder()
    .setTitle('ChatApp API')
    .setDescription(
      'Production-ready NestJS Fastify API for ChatApp.\n\n' +
        'All request/response shapes are defined in `@org/shared`.',
    )
    .setVersion('1.0')
    .addTag('health', 'Application health checks')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}
