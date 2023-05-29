import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DynamodbService } from './dynamodb.service';
import { DynamoDBDto } from './dynamoDB.dto';

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
  postDynamoDb(@Body('item') item: DynamoDBDto) {
    return this.dynamoDBService.addNewRecordDynamoDB(item);
  }
}
