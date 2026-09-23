import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';

@Injectable()
export class AppValidationPipe extends NestValidationPipe implements PipeTransform {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors.map((err) => {
          const constraints = err.constraints ? Object.values(err.constraints) : [];
          return `${err.property}: ${constraints.join(', ')}`;
        });
        return new BadRequestException(messages);
      },
    });
  }

  async transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown> {
    return super.transform(value, metadata);
  }
}
