import { Expose } from 'class-transformer';

export class AccessTokenResponseDto {
  @Expose()
  accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }
}
