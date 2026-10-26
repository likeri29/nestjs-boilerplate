export type UploadableFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

export type UploadObjectOptions = {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType: string;
  cacheControl?: string;
};

export type StoredFile = {
  key: string;
  originalName: string;
  contentType: string;
  size: number;
};

export type DownloadUrlOptions = {
  expiresIn?: number;
  downloadFileName?: string;
};
