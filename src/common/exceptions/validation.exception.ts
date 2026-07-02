import type { HttpException } from '@nestjs/common';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

const validationPipe = new ValidationPipe();
const exceptionFactory = validationPipe.createExceptionFactory() as (
  errors: ValidationError[],
) => HttpException;

export class ValidationException extends BadRequestException {
  constructor(validationErrors: ValidationError[]) {
    super(exceptionFactory(validationErrors).getResponse(), {
      cause: validationErrors,
    });
  }
}
