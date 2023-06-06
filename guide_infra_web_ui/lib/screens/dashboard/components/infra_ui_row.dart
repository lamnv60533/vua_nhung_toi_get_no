import 'package:flutter_svg/svg.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:guide_infra_web_ui/constants.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';

import 'package:flutter/material.dart';

import '../../../models/infra_ui.dto.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:getwidget/getwidget.dart';

var SERVER_URL = dotenv.env['SERVER_HOST'];

class InfraModelRow extends StatefulWidget {
  const InfraModelRow(
      {super.key, required this.infraData, required this.dropdowList});

  final List<InfrastructureBranchModel> infraData;
  final List<OptionModel> dropdowList;

  @override
  State<InfraModelRow> createState() => _InfraModelRowState();
}

class _InfraModelRowState extends State<InfraModelRow> {
  List<OptionModel> s3Objectlist = [OptionModel(name: "empty", code: 1)];
  OptionModel? dropdownValue;
  Future updatePipeline(
      pipelineName, targetBranch, envName, bool runPipeline) async {
    if (!pipelineName?.isEmpty && !targetBranch?.isEmpty) {
      var baseUrl = "$SERVER_URL/code-pipeline/configuration";
      http.Response response = await http.post(
        Uri.parse(baseUrl),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode(<String, dynamic>{
          "pipelineName": pipelineName,
          "targetBranch": targetBranch,
          "runPipeline": runPipeline,
          "envName": envName,
        }),
      );
      print(response.statusCode);
      if (response.statusCode == 201) {
        _showDialog("Update Successfully!");
      } else {
        _showDialog("Update Failed!");
      }
    }
  }

  runUpdatePipeline(
      pipelineName, targetBranch, envName, bool runPipeline) async {
    _showDialog("Updating pipelines...");
    await updatePipeline(pipelineName, targetBranch, envName, runPipeline);
  }

  @override
  initState() {
    super.initState();
    final sd = widget.dropdowList.firstWhere((element) {
      return element.name == widget.infraData[0].TargetBranch;
    }, orElse: () => OptionModel(name: "empty", code: -1));
    setState(() {
      s3Objectlist = widget.dropdowList;
      dropdownValue = sd;
    });
  }

  _showDialog(String message) async {
    Fluttertoast.showToast(
        msg: message,
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.CENTER,
        timeInSecForIosWeb: 5,
        backgroundColor: Colors.black,
        textColor: Colors.white,
        webBgColor: "linear-gradient(to right, #ffffff, #fffff)",
        fontSize: 16.0);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(defaultPadding),
      decoration: const BoxDecoration(
        color: secondaryColor,
        borderRadius: BorderRadius.all(Radius.circular(10)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Pipeline Configuration",
            style: Theme.of(context).textTheme.titleMedium,
          ),
          SizedBox(
            width: double.infinity,
            child: DataTable(
              columnSpacing: defaultPadding,
              // minWidth: 600,
              columns: const [
                DataColumn(
                  label: Text("Environment"),
                ),
                DataColumn(
                  label: Text("Target Branch"),
                ),
                DataColumn(
                  label: Text("Change"),
                ),
                DataColumn(
                  label: Text("Release"),
                ),
              ],
              rows: List.generate(
                widget.infraData.length,
                (index) => pipelineList(widget.infraData[index]),
              ),
            ),
          ),
        ],
      ),
    );
  }

  DataRow pipelineList(
    InfrastructureBranchModel env,
  ) {
    final sd = widget.dropdowList.firstWhere((element) {
      return element.name == env.TargetBranch;
    }, orElse: () => OptionModel(name: "empty", code: -1));
    setState(() {
      dropdownValue = sd;
    });
    return DataRow(
      cells: [
        DataCell(Text(
          env.EnvName,
          textAlign: TextAlign.start,
          style: const TextStyle(fontSize: 16),
        )),
        DataCell(
          DropdownButtonHideUnderline(
            child: GFDropdown(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              borderRadius: BorderRadius.circular(5),
              border: const BorderSide(color: Colors.black12, width: 1),
              dropdownButtonColor: bgColor,
              dropdownColor: bgColor,
              value: dropdownValue,
              onChanged: (newValue) {
                setState(() {
                  dropdownValue = newValue;
                });
              },
              items: s3Objectlist
                  .map<DropdownMenuItem<dynamic>>((OptionModel value) {
                return DropdownMenuItem<dynamic>(
                  value: value,
                  child: Text(value.name),
                );
              }).toList(),
            ),
          ),
        ),
        DataCell(
          GFButton(
              onPressed: () {
                runUpdatePipeline(
                    env.PipelineName, dropdownValue?.name, env.EnvName, false);
              },
              child: const Text("Change")),
        ),
        DataCell(
          GFButton(
              onPressed: () {
                runUpdatePipeline(
                    env.PipelineName, dropdownValue?.name, env.EnvName, true);
              },
              child: const Text("Release")),
        ),
      ],
    );
  }
}
//