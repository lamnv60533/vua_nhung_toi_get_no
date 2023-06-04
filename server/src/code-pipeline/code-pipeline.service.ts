import {
  CodePipelineClient,
  CodePipelineClientConfig,
  ListPipelinesCommand,
  GetPipelineCommand,
  UpdatePipelineCommand,
  StartPipelineExecutionCommand,
} from '@aws-sdk/client-codepipeline';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamodbService } from 'src/dynamodb/dynamodb.service';
import { REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, IS_DEV } from "../config";

@Injectable()
export class CodePipelineService {
  client: any;
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
    return this.client.send(command);
  }

  async getListPipelines(maxResults: number) {
    const input = {
      maxResults: maxResults || 10,
    };
    const command = new ListPipelinesCommand(input);
    return await this.client.send(command);
  }

  async updatePipeline(pipelineName: string, targetBranch: string) {
    // const input1 = {
    //   // StartPipelineExecutionInput
    //   name: pipelineName, // required
    // };
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
    return await this.client.send(updatePipeline);
  }

  async startPipeline(pipelineName: string) {
    const input1 = {
      // StartPipelineExecutionInput
      name: pipelineName, // required
    };

    const command1 = new StartPipelineExecutionCommand(input1);
    return await this.client.send(command1);
  }
}
