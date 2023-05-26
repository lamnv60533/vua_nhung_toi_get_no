import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DynamodbService {
  region = 'ap-northeast-1';
  tableName = 'guide-infra-environment-name';
  documentClient: any;
  constructor() {
    const dynamoDBClient = new DynamoDBClient({ region: this.region });
    this.documentClient = DynamoDBDocumentClient.from(dynamoDBClient);
  }
  async updateDynamoDB() {
    const params = {
      EnvName: 'develop-a',
      TargetBranch: 'develop-a',
      UpdatedAt: Date.now(),
    };
    const response = await this.update(this.tableName, params);
    console.log(response);
  }

  async scanDynamoDB() {
    const response = await this.scan(this.tableName);
    return response;
  }

  async getDynamoDBItem(item: string) {
    const response = await this.get(this.tableName, item);
    console.log(response);
    return response;
  }

  async update(tableName, item) {
    const params = new PutCommand({
      TableName: tableName,
      Item: item,
    });
    return await this.documentClient.send(params);
  }

  async scan(tableName) {
    const command = new ScanCommand({
      ProjectionExpression: 'EnvName, TargetBranch, UpdatedAt',
      TableName: tableName,
    });

    const response = await this.documentClient.send(command);
    for (const bird of response.Items) {
      console.log(
        `${bird.EnvName} - (${bird.TargetBranch}, ${bird.UpdatedAt})`,
      );
    }
    return response.Items;
  }

  async get(tableName, key) {
    const command = new GetCommand({
      Key: {
        EnvName: key,
        TargetBranch: 'develop-a',
      },
      TableName: tableName,
    });

    console.log(command);

    const response = await this.documentClient.send(command);

    return response;
  }
}
