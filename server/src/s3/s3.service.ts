import { Injectable } from '@nestjs/common';
import {
  ListObjectsV2Command,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import {
  REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  S3_BUCKET,
  IS_DEV,
} from '../config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  s3Client: S3Client;
  s3Bucket: string = '';
  constructor(private configservice: ConfigService) {
    const REGION = this.configservice.get<string>('REGION');
    const S3_BUCKET = this.configservice.get<string>('S3_BUCKET');
    const AWS_ACCESS_KEY_ID =
      this.configservice.get<string>('AWS_ACCESS_KEY_ID');
    const AWS_SECRET_ACCESS_KEY = this.configservice.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    const IS_DEV = this.configservice.get<string>('IS_DEV');
    let s3Configs: S3ClientConfig = {
      region: REGION,
    };
    if (IS_DEV) {
      s3Configs = {
        region: REGION,
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
        },
      };
    }
    this.s3Client = new S3Client(s3Configs);
    this.s3Bucket = S3_BUCKET;
  }

  async getListBuckets() {
    const command = new ListObjectsV2Command({
      Bucket: this.s3Bucket,
      // The default and maximum number of keys returned is 1000. This limits it to
      // one for demonstration purposes.
      MaxKeys: 1,
    });

    try {
      let isTruncated = true;
      let contentsList = [];
      let index = 1;
      while (isTruncated) {
        const { Contents, IsTruncated, NextContinuationToken } =
          await this.s3Client.send(command);
        contentsList.push({
          index: index,
          value: Contents.map((c) => c.Key)[0],
        });
        isTruncated = IsTruncated;
        command.input.ContinuationToken = NextContinuationToken;
        index++;
      }
      return contentsList;
    } catch (err) {
      console.error(err);
    }
  }
}
