import { Module } from '@nestjs/common';
import { DynamodbModule } from './dynamodb/dynamodb.module';
import { CodePipelineModule } from './code-pipeline/code-pipeline.module';
import { S3Service } from './s3/s3.service';
import { S3Module } from './s3/s3.module';
import { CodePipelineService } from './code-pipeline/code-pipeline.service';
import { DynamodbService } from './dynamodb/dynamodb.service';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './acl/roles.guard';
import { AuthGuard } from './auth/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { CloudwatchModule } from './cloudwatch/cloudwatch.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    DynamodbModule,
    CodePipelineModule,
    S3Module,
    AuthModule,
    JwtModule,
    CloudwatchModule,
  ],
  controllers: [],
  providers: [
    S3Service,
    DynamodbService,
    CodePipelineService,
    ConfigModule,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
