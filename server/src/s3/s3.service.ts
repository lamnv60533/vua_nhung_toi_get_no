import { Injectable } from '@nestjs/common';
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { log } from 'console';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  s3Client: any;
  s3Bucket: string = '';
  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({});
    this.s3Bucket = this.configService.get<string>('S3_BUCKET');
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
