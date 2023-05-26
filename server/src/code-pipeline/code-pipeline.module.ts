import { Module } from '@nestjs/common';
import { CodePipelineController } from './code-pipeline.controller';
import { CodePipelineService } from './code-pipeline.service';

@Module({
  controllers: [CodePipelineController],
  providers: [CodePipelineService]
})
export class CodePipelineModule {}
