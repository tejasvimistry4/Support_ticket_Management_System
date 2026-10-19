import {
  ArgumentMetadata,
  Injectable,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';
import type { ValidationPipeOptions } from '@nestjs/common';

export const defaultValidationOptions: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
};

@Injectable()
export class AppValidationPipe extends NestValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      ...defaultValidationOptions,
      ...options,
    });
  }

  override async transform(value: any, metadata: ArgumentMetadata) {
    if (!metadata.metatype || metadata.metatype === Object) {
      return value;
    }
    return super.transform(value, metadata);
  }
}
