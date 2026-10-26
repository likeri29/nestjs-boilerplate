import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FILE_SIZE_LIMIT } from 'common/constants/app';

type ApiFileOptions = {
  fieldName?: string;
  maxSize?: number;
  isRequired?: boolean;
};

export function ApiFile({
  fieldName = 'file',
  maxSize = FILE_SIZE_LIMIT,
  isRequired = true,
}: ApiFileOptions = {}): ReturnType<typeof applyDecorators> {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, { limits: { fileSize: maxSize, files: 1 } }),
    ),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: isRequired ? [fieldName] : [],
        properties: { [fieldName]: { type: 'string', format: 'binary' } },
      },
    }),
  );
}
