class OptionModel {
  int code;
  String name;

  OptionModel({
    this.code = 0,
    this.name = "",
  });
}

class InfrastructureBranchModel {
  String EnvName;
  String TargetBranch;
  String PipelineName;

  InfrastructureBranchModel({
    this.EnvName = "",
    this.TargetBranch = "",
    this.PipelineName = "",
  });
}
