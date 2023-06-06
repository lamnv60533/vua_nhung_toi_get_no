import {
  CodePipelineClient,
  CodePipelineClientConfig,
  ListPipelinesCommand,
  GetPipelineCommand,
  UpdatePipelineCommand,
  StartPipelineExecutionCommand,
} from '@aws-sdk/client-codepipeline';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamodbService } from 'src/dynamodb/dynamodb.service';
import { REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, IS_DEV, TARGET_ACCOUNT_ID, TARGET_ROLE_NAME } from "../config";

@Injectable()
export class CodePipelineService {
  client: CodePipelineClient;
  constructor(
    private configService: ConfigService,
    private dynamoDBService: DynamodbService,
  ) {
    let codePipelineConfig: CodePipelineClientConfig = {
      region: REGION,
    }
    if (IS_DEV) {
      codePipelineConfig = {
        region: REGION,
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
        },
      }
    }
    this.client = new CodePipelineClient(codePipelineConfig);
  }
  async configPipeline({ pipelineName, targetBranch, runPipeline, envName }) {
    const updatedCurrentPipeline = await this.updatePipeline(
      pipelineName,
      targetBranch,
    );
    await this.dynamoDBService.updateDynamoDB(envName, targetBranch, pipelineName);
    if (runPipeline) {
      await this.startPipeline(pipelineName);
    }
    return updatedCurrentPipeline;
  }
  async getPipelineData(pipelineName: string) {
    const getPipelineInput = {
      // StartPipelineExecutionInput
      name: pipelineName, // required
    };

    const command = new GetPipelineCommand(getPipelineInput);
    const codepipelineClient = await this.getCodepipelineClient();
    return codepipelineClient.send(command);
  }

  async getListPipelines(maxResults: number) {
    const input = {
      maxResults: maxResults || 10,
    };
    const command = new ListPipelinesCommand(input);
    const codepipelineClient = await this.getCodepipelineClient()
    return await codepipelineClient.send(command);
  }

  async updatePipeline(pipelineName: string, targetBranch: string) {
    const pipelineDataRsp = (await this.getPipelineData(pipelineName)) as any;
    console.log(pipelineDataRsp);
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
    const codepipelineClient = await this.getCodepipelineClient();
    return codepipelineClient.send(updatePipeline);
  }

  async startPipeline(pipelineName: string) {
    const input1 = {
      // StartPipelineExecutionInput
      name: pipelineName, // required
    };

    const command1 = new StartPipelineExecutionCommand(input1);
    const codepipelineClient = await this.getCodepipelineClient();
    return codepipelineClient.send(command1);
  }

  private async getCodepipelineClient() {
    if (IS_DEV) {
      return this.client;
    }
    const credentials = await this.assumeRole(TARGET_ACCOUNT_ID, TARGET_ROLE_NAME);
    return new CodePipelineClient({
      region: REGION,
      credentials: {
        accessKeyId: credentials.AccessKeyId,
        secretAccessKey: credentials.SecretAccessKey,
        sessionToken: credentials.SessionToken,
      },
    });
}

  private async assumeRole(targetAccountId: string, targetRoleName: string) {
    const stsClient = new STSClient({ region: REGION });
    const assumeRoleParams = {
      RoleArn: `arn:aws:iam::${targetAccountId}:role/${targetRoleName}`,
      RoleSessionName: 'AssumedRoleSession',
      DurationSeconds: 900,
    };

    const assumeRoleCommand = new AssumeRoleCommand(assumeRoleParams);
    const assumeRoleResponse = await stsClient.send(assumeRoleCommand);

    const { AccessKeyId, SecretAccessKey, SessionToken } = assumeRoleResponse.Credentials!;

    // Return the temporary credentials
    return { AccessKeyId, SecretAccessKey, SessionToken };
  }
}
