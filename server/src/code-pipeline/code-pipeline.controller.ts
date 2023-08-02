import { Body, Controller, Get, Post, Req, Request } from '@nestjs/common';
import { CodePipelineService } from './code-pipeline.service';
import { PipelineDeclaration } from './pipeline.dto';
import { Roles } from 'src/acl/roles.decorator';
import { Role } from 'src/acl/role.enum';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('code-pipeline')
export class CodePipelineController {
  constructor(private readonly codePipeline: CodePipelineService) {}
  @Post('/configuration')
  @Roles(Role.Admin)
  configuration(@Body() pipeline: PipelineDeclaration, @Req() req: Request) {
    return this.codePipeline.configPipeline(pipeline);
  }
  @Get('')
  @Public()
  getPipeline() {
    return this.codePipeline.getListPipelines(20);
  }
}
