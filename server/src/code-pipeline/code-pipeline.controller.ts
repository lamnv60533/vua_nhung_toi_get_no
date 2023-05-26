import { Body, Controller, Get, Post, Req, Request } from '@nestjs/common';
import { CodePipelineService } from './code-pipeline.service';
import { PipelineDeclaration } from './pipeline.dto';

@Controller('code-pipeline')
export class CodePipelineController {
  constructor(private readonly codePipeline: CodePipelineService) {}
  @Post('/configuration')
  getDynamoDb(@Body() pipeline: PipelineDeclaration, @Req() req: Request) {
    console.log(req.body, pipeline);

    return this.codePipeline.configPipeline(pipeline);
  }
}
