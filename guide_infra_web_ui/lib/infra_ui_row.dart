import 'package:guide_infra_web_ui/pipeline.dart';
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
  Future updatePipeline(pipelineName, targetBranch) async {
    if (!pipelineName?.isEmpty && !targetBranch?.isEmpty) {
      var baseUrl = "$SERVER_URL/code-pipeline/configuration";
      http.Response response = await http.post(
        Uri.parse(baseUrl),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode(<String, String>{
          "pipelineName": pipelineName,
          "targetBranch": targetBranch
        }),
      );

      if (response.statusCode == 200) {
        print("Update OK");
        _showDialog("Update Successfully!");
      } else {
        _showDialog("Update Failed!");
      }
    }
  }

  runUpdatePipeline(pipelineName, targetBranch) async {
    _showDialog("Updating Pipeline.");
    await updatePipeline(pipelineName, targetBranch);
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
    await Future.delayed(Duration(milliseconds: 50));
    showDialog(
        context: context,
        builder: (context) {
          return DialogExample(message: message);
        });
  }

  @override
  Widget build(BuildContext context) {
    var env =
        widget.infraData.EnvName.isNotEmpty ? widget.infraData.EnvName : "";
    return SizedBox(
        child: Padding(
      padding: const EdgeInsets.all(8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          Expanded(
            child:
                Column(mainAxisAlignment: MainAxisAlignment.start, children: [
              Text(
                env,
                textAlign: TextAlign.start,
                style: const TextStyle(fontSize: 24),
              ),
            ]),
          ),
          Expanded(
            child: Row(
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
                    onPressed: () => {
                          runUpdatePipeline(widget.infraData.PipelineName,
                              dropdownValue?.name)
                        },
                    child: const Text("change")),
              ],
            ),
          ),
        ],
      ),

      // ),],
    ));
  }
}

//