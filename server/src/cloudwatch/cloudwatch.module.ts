import { Module } from '@nestjs/common';
import { CloudwatchService } from './cloudwatch.service';
import { CloudwatchController } from './cloudwatch.controller';

@Module({
  providers: [CloudwatchService],
  controllers: [CloudwatchController]
})
export class CloudwatchModule {}
