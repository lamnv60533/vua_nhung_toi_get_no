import 'package:json_annotation/json_annotation.dart';
part 'infra_ui.dto.g.dart';

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

@JsonSerializable()
class InfrastructureBranchModel {
  String EnvName;
  String TargetBranch;
  String PipelineName;

  InfrastructureBranchModel({
    this.EnvName = "",
    this.TargetBranch = "",
    this.PipelineName = "",
  });

  factory InfrastructureBranchModel.fromJson(Map<String, dynamic> json) =>
      _$InfrastructureBranchModelFromJson(json);

  Map<String, dynamic> toJson() => _$InfrastructureBranchModelToJson(this);
}
