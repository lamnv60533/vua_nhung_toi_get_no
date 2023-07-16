// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'infra_ui.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

InfrastructureBranchModel _$InfrastructureBranchModelFromJson(
        Map<String, dynamic> json) =>
    InfrastructureBranchModel(
      EnvName: json['EnvName'] as String? ?? "",
      TargetBranch: json['TargetBranch'] as String? ?? "",
      PipelineName: json['PipelineName'] as String? ?? "",
    );

Map<String, dynamic> _$InfrastructureBranchModelToJson(
        InfrastructureBranchModel instance) =>
    <String, dynamic>{
      'EnvName': instance.EnvName,
      'TargetBranch': instance.TargetBranch,
      'PipelineName': instance.PipelineName,
    };
