import { Module } from '@nestjs/common';
import { DynamodbModule } from './dynamodb/dynamodb.module';
import { CodePipelineModule } from './code-pipeline/code-pipeline.module';
import { S3Service } from './s3/s3.service';
import { S3Module } from './s3/s3.module';
import { CodePipelineService } from './code-pipeline/code-pipeline.service';
import { DynamodbService } from './dynamodb/dynamodb.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    DynamodbModule,
    CodePipelineModule,
    S3Module,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [],
  providers: [S3Service, DynamodbService, CodePipelineService],
})
export class AppModule {}
