import { Module } from '@nestjs/common';
import { CloudwatchService } from './cloudwatch.service';
import { CloudwatchController } from './cloudwatch.controller';
import { ConfigModule } from '@nestjs/config';
import { AssumeRoleModule } from 'src/assume-role/assume-role.module';

@Module({
  providers: [CloudwatchService],
  controllers: [CloudwatchController],
  imports: [AssumeRoleModule],
  exports: [CloudwatchService],
})
export class CloudwatchModule {}
