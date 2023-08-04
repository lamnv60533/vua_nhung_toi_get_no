import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:getwidget/components/loader/gf_loader.dart';
import 'package:getwidget/types/gf_loader_type.dart';
import 'package:go_router/go_router.dart';
import 'package:guide_infra_web_ui/models/infra_ui.dto.dart';
import 'package:guide_infra_web_ui/services/logger.dart';
import 'package:guide_infra_web_ui/services/pipeline_service.dart';
import 'package:guide_infra_web_ui/services/s3_service.dart';
import 'dart:async';

import 'pipeline_row.dart';

class InfraBranchListWidget extends StatefulWidget {
  const InfraBranchListWidget({super.key});
  @override
  State<InfraBranchListWidget> createState() => _InfraBranchListWidgetState();
}

class _InfraBranchListWidgetState extends State<InfraBranchListWidget> {
  bool _loadSuccess = false;
  final pipelineService = PipelineService();
  final s3Service = S3Service();
  final logger = LogService().logger;

  List<OptionModel> optionModels = [OptionModel(code: -1, name: '')];

  List<InfrastructureBranchModel> listTemps = [
    InfrastructureBranchModel(TargetBranch: "")
  ];

  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      try {
        final results = await Future.wait([
          s3Service.getAllCategory(),
          pipelineService.getAllEnv(),
        ]);
        optionModels = results[0] as List<OptionModel>;
        optionModels.add(OptionModel(code: -1, name: ''));
        listTemps = results[1] as List<InfrastructureBranchModel>;
        _loadSuccess = true;
        setState(() {});
      } catch (error) {
        final ex = error as DioException;
        logger.e(error);
        if (ex.response?.statusCode == 401) {
          context.go('/login');
        }
      }
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    var marginTop = MediaQuery.of(context).size.height * 0.35;
    return DefaultTextStyle(
        style: Theme.of(context).textTheme.displayMedium!,
        textAlign: TextAlign.center,
        child: !_loadSuccess
            ? Padding(
                padding: EdgeInsets.only(top: marginTop),
                child: const GFLoader(type: GFLoaderType.circle),
              )
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  InfraModelRow(
                    infraData: listTemps,
                    dropdowList: optionModels,
                  ),
                ],
              ));
  }
}
