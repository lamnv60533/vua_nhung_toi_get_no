import { Module } from '@nestjs/common';
import { DynamodbService } from './dynamodb.service';
import { DynamodbController } from './dynamodb.controller';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
  imports: [ConfigModule],
  providers: [DynamodbService],
  controllers: [DynamodbController],
  exports: [DynamodbService],
})
export class DynamodbModule {}
