import { Module } from '@nestjs/common';
import { AssumeRoleService } from './assume-role.service';

@Module({
  imports: [],
  providers: [AssumeRoleService],
  exports: [AssumeRoleService],
})
export class AssumeRoleModule {}
