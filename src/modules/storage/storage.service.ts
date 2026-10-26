import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { OnModuleInit } from '@nestjs/common';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SIGNED_URL_EXPIRATION } from 'common/constants/app';

import type { Env } from 'environment/environment.type';
import { S3_CLIENT } from 'modules/storage/constants/s3-client.const';
import type {
  DownloadUrlOptions,
  StoredFile,
  UploadableFile,
  UploadObjectOptions,
} from 'modules/storage/types/storage.types';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);

  private readonly bucket: string;

  private readonly isDevelopment: boolean;

  constructor(
    @Inject(S3_CLIENT) private readonly s3Client: S3Client,
    configService: ConfigService<Env, true>,
  ) {
    this.bucket = configService.get('S3_BUCKET', { infer: true });
    this.isDevelopment = configService.get('isDevelopment', { infer: true });
  }

  async onModuleInit(): Promise<void> {
    if (this.isDevelopment) await this.ensureBucketExists();
  }

  generateKey(folder: string, originalName: string): string {
    const extension = extname(originalName).toLowerCase();

    return `${folder}/${randomUUID()}${extension}`;
  }

  async upload({
    key,
    body,
    contentType,
    cacheControl,
  }: UploadObjectOptions): Promise<void> {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          CacheControl: cacheControl,
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload file', {
        cause: error,
      });
    }
  }

  async uploadFile(file: UploadableFile, folder: string): Promise<StoredFile> {
    const key = this.generateKey(folder, file.originalname);

    await this.upload({ key, body: file.buffer, contentType: file.mimetype });

    return {
      key,
      originalName: file.originalname,
      contentType: file.mimetype,
      size: file.size,
    };
  }

  async getDownloadUrl(
    key: string,
    {
      expiresIn = SIGNED_URL_EXPIRATION,
      downloadFileName,
    }: DownloadUrlOptions = {},
  ): Promise<string> {
    const contentDisposition = downloadFileName
      ? `attachment; filename*=UTF-8''${encodeURIComponent(downloadFileName)}`
      : undefined;

    return getSignedUrl(
      this.s3Client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ResponseContentDisposition: contentDisposition,
      }),
      { expiresIn },
    );
  }

  async getUploadUrl(
    key: string,
    contentType: string,
    expiresIn = SIGNED_URL_EXPIRATION,
  ): Promise<string> {
    return getSignedUrl(
      this.s3Client,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn },
    );
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );

      return true;
    } catch (error) {
      if (this.isNotFoundError(error)) return false;

      throw new InternalServerErrorException('Failed to check file', {
        cause: error,
      });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete file', {
        cause: error,
      });
    }
  }

  private isNotFoundError(error: unknown): boolean {
    return (
      error instanceof S3ServiceException &&
      (error.name === 'NotFound' ||
        error.name === 'NoSuchKey' ||
        error.$metadata.httpStatusCode === 404)
    );
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch (error) {
      if (!this.isNotFoundError(error)) {
        const reason = error instanceof Error ? error.message : String(error);

        this.logger.warn(`Storage is unreachable: ${reason}`);

        return;
      }

      await this.s3Client.send(
        new CreateBucketCommand({ Bucket: this.bucket }),
      );
      this.logger.log(`Created bucket "${this.bucket}"`);
    }
  }
}
