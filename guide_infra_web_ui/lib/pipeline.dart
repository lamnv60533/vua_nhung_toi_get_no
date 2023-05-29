import 'dart:developer';

import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'package:flutter/material.dart';

import 'infra_ui_row.dart';

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

class DropdownDemo extends StatefulWidget {
  const DropdownDemo({Key? key}) : super(key: key);
  @override
  State<DropdownDemo> createState() => _DropdownDemoState();
}

class _DropdownDemoState extends State<DropdownDemo> {
  List<InfrastructureBranchModel> infrastructureBranchModel = [];
  Future getAllEnv() async {
    var baseUrl = "$SERVER_URL/dynamodb";

    http.Response response = await http.get(Uri.parse(baseUrl));

    if (response.statusCode == 200) {
      var jsonData = json.decode(response.body);

      var tmp = ((jsonData as dynamic) as List<dynamic>).map((dynamic item) {
        final mapObject = item as Map<String, dynamic>;
        return InfrastructureBranchModel(
            EnvName: mapObject["EnvName"],
            TargetBranch: mapObject["TargetBranch"],
            PipelineName: mapObject["PipelineName"]);
      });
      if (tmp.isNotEmpty) {
        setState(() {
          infrastructureBranchModel = tmp.toList();
        });
      }
    }
  }

  abc() async {
    await getAllEnv();
  }

  @override
  initState() {
    super.initState();
    abc();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: infrastructureBranchModel
          .map((item) => InfraModelRow(infraData: item))
          .toList(),
    );
    ;
  }
}
