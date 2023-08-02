import { Injectable } from '@nestjs/common';
import {
  CloudWatchClient,
  CloudWatchClientConfig,
  ListMetricsCommand,
} from '@aws-sdk/client-cloudwatch';
import { ConfigService } from '@nestjs/config';
import {
  ActivateEventSourceCommand,
  EventBridgeClient,
  EventBridgeClientConfig,
  ListEventBusesCommand,
  ListRulesCommand,
  ListRulesCommandInput,
  ListRulesCommandOutput,
  ListTargetsByRuleCommand,
  PutRuleCommand,
} from '@aws-sdk/client-eventbridge';
import { log } from 'console';

@Injectable()
export class CloudwatchService {
  client: CloudWatchClient;
  eventClient: EventBridgeClient;
  REGION: any;
  AWS_ACCESS_KEY_ID: any;
  AWS_SECRET_ACCESS_KEY: any;
  IS_DEV: any;
  TARGET_ACCOUNT_ID: any;
  TARGET_ROLE_NAME: any;
  constructor(private configService: ConfigService) {
    this.REGION = this.configService.get<string>('REGION');
    this.AWS_ACCESS_KEY_ID =
      this.configService.get<string>('AWS_ACCESS_KEY_ID');
    this.AWS_SECRET_ACCESS_KEY = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    this.IS_DEV = this.configService.get<boolean>('IS_DEV');
    this.TARGET_ACCOUNT_ID =
      this.configService.get<string>('TARGET_ACCOUNT_ID');
    this.TARGET_ROLE_NAME = this.configService.get<string>('TARGET_ROLE_NAME');
    let cloudWatchClientConfig: CloudWatchClientConfig = {
      region: this.REGION,
    };

    let eventBridgeClientConfig: EventBridgeClientConfig = {
      region: this.REGION,
    };
    if (this.IS_DEV) {
      cloudWatchClientConfig = {
        region: this.REGION,
        credentials: {
          accessKeyId: this.AWS_ACCESS_KEY_ID,
          secretAccessKey: this.AWS_SECRET_ACCESS_KEY,
        },
      };
    }
    this.client = new CloudWatchClient(cloudWatchClientConfig);
    this.eventClient = new EventBridgeClient(eventBridgeClientConfig);
  }

  async test() {
    return this.handleTriggerEventForChangeSource(
      'kc-member-site-src.develop-performance',
      'kc-member-site-src.develop-september-2023',
    );
  }
  async handleTriggerEventForChangeSource(
    currentS3Name: string,
    targetS3Name: string,
  ) {
    const list = await this.getCloudWatchEvent();
    const currentEventWatch = list.Rules.filter((event) => {
      const eventPattern = JSON.parse(event.EventPattern);
      const key = eventPattern?.detail?.requestParameters?.key;
      return key && key?.includes(currentS3Name);
    });
    console.log('========', currentEventWatch);

    if (currentEventWatch.length) {
      const currentEventWatchName = currentEventWatch[0].Name;

      const targetEventWatch = Object.assign({}, { ...currentEventWatch[0] });
      const eventPattern = JSON.parse(targetEventWatch.EventPattern);
      const currentKey = eventPattern.detail.requestParameters.key;

      console.log('===', currentKey);

      const tmp = currentKey.map((x) =>
        x === currentS3Name ? targetS3Name : x,
      );
      console.log('===', tmp);

      eventPattern.detail.requestParameters.key = tmp;

      console.log('====', JSON.stringify(eventPattern), currentEventWatchName);

      const command = new PutRuleCommand({
        EventPattern: JSON.stringify(eventPattern),
        Name: currentEventWatchName,
      });
      return this.putRuleCommand(command);
    }
  }

  async getCloudWatchEvent(): Promise<ListRulesCommandOutput> {
    const input: ListRulesCommandInput = {
      // ListEventBusesRequest
      NamePrefix: 'codepipeline-',
      // NextToken: "STRING_VALUE",
      Limit: 50,
    };
    const command = new ListRulesCommand(input);
    try {
      return await this.eventClient.send(command);
    } catch (err) {
      console.error(err);
    }
  }
  putRuleCommand = async (command) => {
    try {
      return await this.eventClient.send(command);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  getListTargetsByRuleCommand = async () => {
    const input = {
      // ListEventBusesRequest
      NamePrefix: 'codepipeline',
      // NextToken: "STRING_VALUE",
      Limit: 20,
    };
    const command = new ListTargetsByRuleCommand({
      Rule: 'codepipeline-12207088-devkcmsrsources-rule-test',
    });
    try {
      return await this.eventClient.send(command);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
}
