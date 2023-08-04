import {
  CodePipelineClient,
  CodePipelineClientConfig,
  ListPipelinesCommand,
  GetPipelineCommand,
  UpdatePipelineCommand,
  StartPipelineExecutionCommand,
} from '@aws-sdk/client-codepipeline';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AssumeRoleService } from 'src/assume-role/assume-role.service';
import { CloudwatchService } from 'src/cloudwatch/cloudwatch.service';
import { DynamodbService } from 'src/dynamodb/dynamodb.service';
@Injectable()
export class CodePipelineService implements OnModuleInit {
  client: CodePipelineClient;
  REGION: string = '';
  AWS_ACCESS_KEY_ID: string;
  IS_DEV: boolean;
  TARGET_ACCOUNT_ID: string;
  TARGET_ROLE_NAME: string;
  AWS_SECRET_ACCESS_KEY: string;
  constructor(
    private configService: ConfigService,
    private dynamoDBService: DynamodbService,
    private cloudWatchService: CloudwatchService,
    private assumeRoleService: AssumeRoleService,
  ) {
    this.REGION = this.configService.get<string>('REGION');
    this.AWS_ACCESS_KEY_ID =
      this.configService.get<string>('AWS_ACCESS_KEY_ID');
    this.AWS_SECRET_ACCESS_KEY = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    this.IS_DEV = this.configService.get<boolean>('IS_DEV');
    this.TARGET_ACCOUNT_ID =
      this.configService.get<string>('TARGET_ACCOUNT_ID');
    this.TARGET_ROLE_NAME = this.configService.get<string>('TARGET_ROLE_NAME');
  }
  async onModuleInit() {
    let codePipelineConfig: CodePipelineClientConfig = {
      region: this.REGION,
    };
    if (this.IS_DEV) {
      codePipelineConfig = {
        region: this.REGION,
        credentials: {
          accessKeyId: this.AWS_ACCESS_KEY_ID,
          secretAccessKey: this.AWS_SECRET_ACCESS_KEY,
        },
      };
      this.client = new CodePipelineClient(codePipelineConfig);
    } else {
      this.client = this.assumeRoleService.codePipelineClient;
    }
  }
  async configPipeline({ pipelineName, targetBranch, runPipeline, envName }) {
    try {
      const updatedCurrentPipeline = await this.updatePipeline(
        pipelineName,
        targetBranch,
      );
      console.log('====', envName, targetBranch, pipelineName);

      await this.dynamoDBService.updateDynamoDB(
        envName,
        targetBranch,
        pipelineName,
      );
      if (runPipeline) {
        await this.startPipeline(pipelineName);
      }
      return updatedCurrentPipeline;
    } catch (error) {
      console.log('======>', error);
    }
  }
  async getPipelineData(pipelineName: string) {
    const getPipelineInput = {
      // StartPipelineExecutionInput
      name: pipelineName, // required
    };

    const command = new GetPipelineCommand(getPipelineInput);

    const data = await this.client.send(command);
    return data;
  }

  async getListPipelines(maxResults: number) {
    const input = {
      maxResults: maxResults || 10,
    };
    const command = new ListPipelinesCommand(input);
    return await this.client.send(command);
  }

  async updatePipeline(pipelineName: string, targetBranch: string) {
    const pipelineDataRsp = (await this.getPipelineData(pipelineName)) as any;
    const currentS3Source =
      pipelineDataRsp.pipeline.stages[0].actions[0].configuration.S3ObjectKey;
    pipelineDataRsp.pipeline.stages[0].actions[0].configuration.S3ObjectKey =
      targetBranch;

    const pipelineData = pipelineDataRsp.pipeline;
    const artifactStore = pipelineData.artifactStore;

    const updatePipelineInput = {
      // UpdatePipelineInput
      pipeline: {
        // PipelineDeclaration
        name: pipelineData.name, // required
        roleArn: pipelineData.roleArn, // required
        artifactStore: {
          // ArtifactStore
          type: artifactStore.type, // required
          location: artifactStore.location, // required
        },
        stages: pipelineData.stages,
      },
    };

    const updatePipeline = new UpdatePipelineCommand(
      updatePipelineInput as any,
    );

    try {
      this.cloudWatchService.handleTriggerEventForChangeSource(
        currentS3Source,
        targetBranch,
      );
      return this.client.send(updatePipeline);
    } catch (error) {
      console.log('========> ', error);
    }
  }

  async startPipeline(pipelineName: string) {
    const input1 = {
      // StartPipelineExecutionInput
      name: pipelineName, // required
    };

    const command1 = new StartPipelineExecutionCommand(input1);
    return this.client.send(command1);
  }
}
