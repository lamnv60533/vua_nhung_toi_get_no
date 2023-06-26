import {
  DynamoDBClient,
  DynamoDBClientConfig,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { Injectable } from '@nestjs/common';
import { DynamoDBDto } from './dynamoDB.dto';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class DynamodbService {
  tableName = '';
  documentClient: DynamoDBClient;
  constructor(private configService: ConfigService) {
    const REGION = this.configService.get<string>('REGION');
    const DYNAMO_TABLE = this.configService.get<string>('DYNAMO_TABLE');
    const AWS_ACCESS_KEY_ID =
      this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const AWS_SECRET_ACCESS_KEY = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    const IS_DEV = this.configService.get<boolean>('IS_DEV');
    let dynamoDBConfig: DynamoDBClientConfig = {
      region: REGION,
    };
    if (IS_DEV) {
      dynamoDBConfig = {
        region: REGION,
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
        },
      };
    }
    this.tableName = DYNAMO_TABLE;
    const dynamoDBClient = new DynamoDBClient(dynamoDBConfig);
    this.documentClient = DynamoDBDocumentClient.from(dynamoDBClient);
  }
  async updateDynamoDB(envName, targetBranch, pipelineName) {
    const params: DynamoDBDto = {
      EnvName: envName,
      TargetBranch: targetBranch,
      PipelineName: pipelineName,
      UpdatedAt: Date.now(),
    };
    const response = await this.update(this.tableName, params);
    return response;
  }

  async addNewRecordDynamoDB(data: DynamoDBDto) {
    const response = await this.add(
      this.tableName,
      data.EnvName,
      data.TargetBranch,
    );
    return response;
  }

  async scanDynamoDB() {
    const response = await this.scan(
      this.tableName,
      DynamoDBDto.create('', '', Date.now()),
    );
    return response;
  }

  async getDynamoDBItem(item: string) {
    const command = new GetCommand({
      Key: {
        EnvName: item,
      },
      TableName: this.tableName,
    });
    const response = await this.get(command);
    return response;
  }

  async update(tableName, item: DynamoDBDto) {
    const data = {
      EnvName: item.EnvName,
      TargetBranch: item.TargetBranch,
      PipelineName: item.PipelineName,
      UpdatedAt: item.UpdatedAt,
    };
    var params = {
      TableName: tableName,
      Item: {
        ...data,
      },
    };

    return await this.documentClient.send(new PutCommand(params));
  }

  async scan(tableName, tableObjective) {
    const projections = Object.keys(tableObjective).join(',');
    const command = new ScanCommand({
      ProjectionExpression: projections,
      TableName: tableName,
    });
    let result = [];
    const response = await this.documentClient.send(command);
    for (const db of response.Items) {
      result.push(
        DynamoDBDto.create(
          db.EnvName?.S,
          db?.TargetBranch?.S,
          db?.UpdatedAt?.N,
          db?.PipelineName?.S,
        ),
      );
    }
    return result;
  }

  async get(command: GetCommand) {
    const response = await this.documentClient.send(command);
    return response;
  }

  async add(tableName, envName, targetBranch) {
    const command = new GetCommand({
      Key: {
        EnvName: envName,
        TargetBranch: targetBranch,
      },
      TableName: tableName,
    });
    const response = await this.documentClient.send(command);
    return response;
  }
  async addItem(command: PutCommand) {
    const response = await this.documentClient.send(command);
    return response;
  }
}
