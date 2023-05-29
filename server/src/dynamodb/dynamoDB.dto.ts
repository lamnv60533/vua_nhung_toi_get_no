export class DynamoDBDto {
  static create(envName, target, updatedAt, pipelineName?) {
    const dynamoDBObj = new DynamoDBDto();
    dynamoDBObj.EnvName = envName;
    dynamoDBObj.TargetBranch = target;
    dynamoDBObj.UpdatedAt = updatedAt;
    dynamoDBObj.PipelineName = pipelineName;
    return dynamoDBObj;
  }
  EnvName: string;
  TargetBranch: string;
  UpdatedAt: Date;
  PipelineName: string;
}
