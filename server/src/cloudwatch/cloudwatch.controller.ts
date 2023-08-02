import { Controller, Get, Post } from '@nestjs/common';
import { CloudwatchService } from './cloudwatch.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('cloudwatch')
export class CloudwatchController {
  constructor(private readonly cloudwatchService: CloudwatchService) {}

  @Get('')
  @Public()
  getPipeline() {
    return this.cloudwatchService.getCloudWatchEvent();
  }

  @Get('target')
  @Public()
  getRuleTarget() {
    return this.cloudwatchService.getListTargetsByRuleCommand();
  }

  @Post('')
  @Public()
  updatePipelineTrigger() {
    return this.cloudwatchService.test();
  }
}
