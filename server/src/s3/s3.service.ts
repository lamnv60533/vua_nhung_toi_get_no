import { Injectable } from '@nestjs/common';
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  s3Client: any;
  constructor() {
    this.s3Client = new S3Client({});
  }

  async getListBuckets() {
    const command = new ListObjectsV2Command({
      Bucket: 'dev-kcmsr-sources',
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
