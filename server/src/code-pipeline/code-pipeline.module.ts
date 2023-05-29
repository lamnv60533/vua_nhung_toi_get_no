import { Module } from '@nestjs/common';
import { CodePipelineController } from './code-pipeline.controller';
import { CodePipelineService } from './code-pipeline.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [CodePipelineController],
  providers: [CodePipelineService],
})
export class CodePipelineModule {}
