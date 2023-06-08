class OptionModel {
  int code;
  String name;

  OptionModel({
    this.code = 0,
    this.name = "",
  });

  @override
  operator ==(other) => other is OptionModel && code == other.code;

  @override
  int get hashCode => code;
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
