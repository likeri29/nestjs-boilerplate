import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { runSeeders } from 'typeorm-extension';

import { Env } from 'environment/environment.type';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  private readonly projectName: string;

  private readonly isProduction: boolean;

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService<Env, true>,
  ) {
    this.projectName = this.configService.get('PROJECT_NAME', { infer: true });
    this.isProduction = this.configService.get('isProduction', { infer: true });
  }

  async getProjectName(): Promise<string> {
    const { sentenceCase } = await import('change-case');

    return sentenceCase(this.projectName);
  }

  private async runSeeders(): Promise<void> {
    if (!this.isProduction) {
      this.logger.log('Running seeders...');

      await runSeeders(this.dataSource, {
        seeds: [],
      });
    }
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.runSeeders();
  }
}
