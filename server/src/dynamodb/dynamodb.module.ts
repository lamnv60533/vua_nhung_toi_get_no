import { Module } from '@nestjs/common';
import { DynamodbService } from './dynamodb.service';
import { DynamodbController } from './dynamodb.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [DynamodbService],
  controllers: [DynamodbController],
  exports: [DynamodbService],
})
export class DynamodbModule {}
