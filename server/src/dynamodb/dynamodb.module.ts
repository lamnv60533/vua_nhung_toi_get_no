import { Module } from '@nestjs/common';
import { DynamodbService } from './dynamodb.service';
import { DynamodbController } from './dynamodb.controller';
import { AssumeRoleModule } from 'src/assume-role/assume-role.module';

@Module({
  imports: [AssumeRoleModule],
  providers: [DynamodbService],
  controllers: [DynamodbController],
  exports: [DynamodbService],
})
export class DynamodbModule {}
