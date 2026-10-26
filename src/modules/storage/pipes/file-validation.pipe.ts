import type { ParseFilePipe } from '@nestjs/common';
import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';
import { FILE_SIZE_LIMIT, IMAGE_FILE_TYPE } from 'common/constants/app';

type FileValidationOptions = {
  fileType?: string | RegExp;
  maxSize?: number;
  isRequired?: boolean;
};

export function createFileValidationPipe({
  fileType = IMAGE_FILE_TYPE,
  maxSize = FILE_SIZE_LIMIT,
  isRequired = true,
}: FileValidationOptions = {}): ParseFilePipe {
  return new ParseFilePipeBuilder()
    .addFileTypeValidator({ fileType })
    .addMaxSizeValidator({ maxSize })
    .build({
      fileIsRequired: isRequired,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    });
}
