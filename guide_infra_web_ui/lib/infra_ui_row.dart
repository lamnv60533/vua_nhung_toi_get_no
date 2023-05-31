import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';

import 'package:flutter/material.dart';

import 'dialog.dart';
import 'infra_ui.dto.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:getwidget/getwidget.dart';

var SERVER_URL = dotenv.env['SERVER_HOST'];

class InfraModelRow extends StatefulWidget {
  const InfraModelRow(
      {super.key, required this.infraData, required this.dropdowList});

  final InfrastructureBranchModel infraData;
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
    _showDialog("Updating Pipeline.");
    await updatePipeline(pipelineName, targetBranch, envName, runPipeline);
  }

  @override
  initState() {
    super.initState();
    final sd = widget.dropdowList.firstWhere((element) {
      return element.name == widget.infraData.TargetBranch;
    }, orElse: () => OptionModel(name: "empty", code: -1));
    setState(() {
      s3Objectlist = widget.dropdowList;
      dropdownValue = sd;
    });
  }

  _showDialog(String message) async {
    GFToast.showToast(
      message,
      context,
      toastPosition: GFToastPosition.TOP,
      textStyle: TextStyle(fontSize: 16, color: GFColors.DARK),
      backgroundColor: GFColors.LIGHT,
      trailing: const Icon(
        Icons.notifications,
        color: GFColors.SUCCESS,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    var env =
        widget.infraData.EnvName.isNotEmpty ? widget.infraData.EnvName : "";
    return SizedBox(
        child: Padding(
      padding: EdgeInsets.symmetric(horizontal: 50),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 500,
            child: Text(
              env,
              textAlign: TextAlign.start,
              style: const TextStyle(fontSize: 24),
            ),
          ),
          Row(
            children: [
              DropdownButtonHideUnderline(
                child: GFDropdown(
                  padding: const EdgeInsets.all(3),
                  borderRadius: BorderRadius.circular(5),
                  border: const BorderSide(color: Colors.black12, width: 1),
                  dropdownButtonColor: Colors.grey[300],
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
              const SizedBox(
                width: 50,
              ),
              GFButton(
                  onPressed: () {
                    GFToast.showToast(
                      'Updating pipeline...',
                      context,
                      toastPosition: GFToastPosition.TOP,
                      textStyle: TextStyle(fontSize: 16, color: GFColors.DARK),
                      backgroundColor: GFColors.LIGHT,
                      trailing: const Icon(
                        Icons.notifications,
                        color: GFColors.SUCCESS,
                      ),
                    );

                    runUpdatePipeline(widget.infraData.PipelineName,
                        dropdownValue?.name, widget.infraData.EnvName, false);
                  },
                  child: const Text("change")),
              const SizedBox(
                width: 50,
              ),
              GFButton(
                  onPressed: () {
                    var a = 0;
                    runUpdatePipeline(widget.infraData.PipelineName,
                        dropdownValue?.name, widget.infraData.EnvName, true);
                  },
                  child: const Text("change and release")),
            ],
          ),
        ],
      ),

      // ),],
    ));
  }
}

//