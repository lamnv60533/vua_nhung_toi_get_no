import { CodePipelineClient } from '@aws-sdk/client-codepipeline';
import {
  AssumeRoleCommand,
  AssumeRoleCommandInput,
  STSClient,
} from '@aws-sdk/client-sts';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AssumeRoleService {
  REGION: string = '';
  IS_DEV: boolean;
  TARGET_ACCOUNT_ID: string;
  TARGET_ROLE_NAME: string;
  STS_SECRET_ACCESS_KEY: string;
  STS_ACCESS_KEY_ID: string;
  STS_SESSION_TOKEN: string;
  codePipelineClient: CodePipelineClient;
  private readonly logger = new Logger(AssumeRoleService.name);

  constructor(private configService: ConfigService) {
    this.REGION = this.configService.get<string>('REGION');
    this.IS_DEV = this.configService.get<boolean>('IS_DEV');
    this.TARGET_ACCOUNT_ID =
      this.configService.get<string>('TARGET_ACCOUNT_ID') || '613546001725';
    this.TARGET_ROLE_NAME =
      this.configService.get<string>('TARGET_ROLE_NAME') ||
      'cross-account-universal-service-guide-access-role';
  }
  async assumeRole(targetAccountId: string = '', targetRoleName: string = '') {
    const stsClient = new STSClient({ region: this.REGION });
    const assumeRoleParams: AssumeRoleCommandInput = {
      RoleArn: `arn:aws:iam::${this.TARGET_ACCOUNT_ID}:role/${this.TARGET_ROLE_NAME}`,
      RoleSessionName: 'AssumedRoleSession',
      DurationSeconds: 70 * 60,
    };

    const assumeRoleCommand = new AssumeRoleCommand(assumeRoleParams);
    const assumeRoleResponse = await stsClient.send(assumeRoleCommand);

    const { AccessKeyId, SecretAccessKey, SessionToken } =
      assumeRoleResponse.Credentials!;

    // Return the temporary credentials
    this.STS_ACCESS_KEY_ID = AccessKeyId;
    this.STS_SECRET_ACCESS_KEY = SecretAccessKey;
    this.STS_SESSION_TOKEN = SessionToken;
    return { AccessKeyId, SecretAccessKey, SessionToken };
  }
  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    if (!this.IS_DEV) {
      await this.assumeRole();
      this.getCodepipelineClient();
    }
  }

  private async getCodepipelineClient() {
    this.codePipelineClient = new CodePipelineClient({
      region: this.REGION,
      credentials: {
        accessKeyId: this.STS_ACCESS_KEY_ID,
        secretAccessKey: this.STS_SECRET_ACCESS_KEY,
        sessionToken: this.STS_SESSION_TOKEN,
      },
    });
  }
}
