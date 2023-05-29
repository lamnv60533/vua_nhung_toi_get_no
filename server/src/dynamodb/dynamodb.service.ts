import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
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
  region = '';
  tableName = '';
  documentClient: any;
  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('REGION');
    this.tableName = this.configService.get<string>('DYNAMO_TABLE');
    const dynamoDBClient = new DynamoDBClient({ region: this.region });
    this.documentClient = DynamoDBDocumentClient.from(dynamoDBClient);
  }
  async updateDynamoDB(envName, targetBranch) {
    const params = {
      EnvName: envName,
      TargetBranch: targetBranch,
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
    const response = await this.get(this.tableName, item);
    return response;
  }

  async update(tableName, item) {
    const params = new PutCommand({
      TableName: tableName,
      Item: item,
    });
    return await this.documentClient.send(params);
  }

  async scan(tableName, tableObjective) {
    var projections = Object.keys(tableObjective).join(',');
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
          db?.PipelineName.S,
        ),
      );
    }
    return result;
  }

  async get(tableName, key) {
    const command = new GetCommand({
      Key: {
        EnvName: key,
        TargetBranch: 'develop-a',
      },
      TableName: tableName,
    });
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
}
