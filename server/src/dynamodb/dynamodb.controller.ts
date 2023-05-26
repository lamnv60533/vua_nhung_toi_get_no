import { Controller, Get, Param, Post } from '@nestjs/common';
import { DynamodbService } from './dynamodb.service';

@Controller('dynamodb')
export class DynamodbController {
  constructor(private readonly dynamoDBService: DynamodbService) {}
  @Get('/')
  getDynamoDb() {
    return this.dynamoDBService.scanDynamoDB();
  }

  @Get('/:item')
  getDynamoDbByItem(@Param('item') item: string) {
    return this.dynamoDBService.getDynamoDBItem(item);
  }
  @Post('/')
  postDynamoDb() {
    return this.dynamoDBService.scanDynamoDB();
  }
}
