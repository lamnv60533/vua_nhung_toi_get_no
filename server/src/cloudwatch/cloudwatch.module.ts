import { Module } from '@nestjs/common';
import { CloudwatchService } from './cloudwatch.service';
import { CloudwatchController } from './cloudwatch.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [CloudwatchService],
  controllers: [CloudwatchController],
  imports: [],
  exports: [CloudwatchService],
})
export class CloudwatchModule {}
