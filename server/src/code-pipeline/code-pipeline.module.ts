import { Module } from '@nestjs/common';
import { CodePipelineController } from './code-pipeline.controller';
import { CodePipelineService } from './code-pipeline.service';
import { ConfigModule } from '@nestjs/config';
import { DynamodbModule } from 'src/dynamodb/dynamodb.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/auth/auth.guard';
import { CloudwatchModule } from 'src/cloudwatch/cloudwatch.module';
import { AssumeRoleModule } from 'src/assume-role/assume-role.module';

@Module({
  imports: [DynamodbModule, CloudwatchModule, AssumeRoleModule],
  controllers: [CodePipelineController],
  providers: [CodePipelineService],
})
export class CodePipelineModule {}
