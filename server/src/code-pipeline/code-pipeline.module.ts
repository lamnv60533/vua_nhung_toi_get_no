import { Module } from '@nestjs/common';
import { CodePipelineController } from './code-pipeline.controller';
import { CodePipelineService } from './code-pipeline.service';
import { ConfigModule } from '@nestjs/config';
import { DynamodbModule } from 'src/dynamodb/dynamodb.module';

@Module({
  imports: [ConfigModule, DynamodbModule],
  controllers: [CodePipelineController],
  providers: [CodePipelineService],
})
export class CodePipelineModule {}
