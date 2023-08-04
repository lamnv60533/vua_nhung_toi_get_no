import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EventBridgeClient,
  EventBridgeClientConfig,
  ListRulesCommand,
  ListRulesCommandInput,
  ListRulesCommandOutput,
  ListTargetsByRuleCommand,
  PutRuleCommand,
} from '@aws-sdk/client-eventbridge';

@Injectable()
export class CloudwatchService {
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

    let eventBridgeClientConfig: EventBridgeClientConfig = {
      region: this.REGION,
    };
    this.eventClient = new EventBridgeClient(eventBridgeClientConfig);
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

    if (currentEventWatch.length) {
      const currentEventWatchName = currentEventWatch[0].Name;

      const targetEventWatch = Object.assign({}, { ...currentEventWatch[0] });
      const eventPattern = JSON.parse(targetEventWatch.EventPattern);
      const currentKey = eventPattern.detail.requestParameters.key;

      const tmp = currentKey.map((x) =>
        x === currentS3Name ? targetS3Name : x,
      );
      eventPattern.detail.requestParameters.key = tmp;

      const command = new PutRuleCommand({
        EventPattern: JSON.stringify(eventPattern),
        Name: currentEventWatchName,
      });
      return this.putRuleCommand(command);
    }
  }

  async getCloudWatchEvent(
    prefix: string = 'codepipeline-',
  ): Promise<ListRulesCommandOutput> {
    const input: ListRulesCommandInput = {
      // ListEventBusesRequest
      NamePrefix: prefix,
      // NextToken: "STRING_VALUE",
      Limit: 50,
    };
    const command = new ListRulesCommand(input);
    try {
      return await this.eventClient.send(command);
    } catch (err) {
      console.error(err);
      throw err;
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
