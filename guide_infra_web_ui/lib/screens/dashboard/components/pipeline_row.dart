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
  List<OptionModel> selectOptions = [OptionModel(code: -1, name: '')];

  bool showalert = false;
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

  void runUpdatePipeline(
      pipelineName, targetBranch, envName, bool runPipeline) async {
    _showDialog("Updating pipelines...");
    await updatePipeline(pipelineName, targetBranch, envName, runPipeline);
  }

  final infraNameHash = {};
  bool showblur = false;
  bool release = false;
  String message = "";
  String pipelineName = "";
  String targetBranch = "";
  String envName = "";
  @override
  initState() {
    super.initState();

    selectOptions = widget.infraData.map((e) {
      if (widget.dropdowList.any((element) => element.name == e.TargetBranch)) {
        final item = widget.dropdowList
            .firstWhere((element) => element.name == e.TargetBranch);
        return OptionModel(code: item.code, name: item.name);
      }
      return OptionModel(code: -1, name: '-1');
    }).toList();
    showalert = false;
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
    var marginTop = MediaQuery.of(context).size.height * 0.1;
    var marginLeft = MediaQuery.of(context).size.width * 0.15;
    return GFFloatingWidget(
      horizontalPosition: marginLeft,
      verticalPosition: marginTop,
      body: Container(
        padding: const EdgeInsets.all(defaultPadding),
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
              child: selectOptions.isEmpty
                  ? const SizedBox()
                  : DataTable(
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
                        (index) {
                          final env = widget.infraData[index];
                          return DataRow(
                            cells: [
                              DataCell(SelectableText(
                                env.EnvName,
                                textAlign: TextAlign.start,
                                style: const TextStyle(fontSize: 16),
                              )),
                              DataCell(
                                widget.dropdowList.isEmpty
                                    ? const SizedBox()
                                    : DropdownButtonHideUnderline(
                                        child: GFDropdown(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 20),
                                          borderRadius:
                                              BorderRadius.circular(5),
                                          border: const BorderSide(
                                              color: Colors.black12, width: 1),
                                          dropdownButtonColor: bgColor,
                                          dropdownColor: bgColor,
                                          value: selectOptions[index],
                                          onChanged: (newValue) {
                                            setState(() {
                                              selectOptions[index] = newValue!;
                                            });
                                          },
                                          items: widget.dropdowList
                                              .map<DropdownMenuItem<dynamic>>(
                                                  (OptionModel value) {
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
                                      setState(() {
                                        showalert = true;
                                        message = "change";
                                        release = false;
                                        pipelineName = env.PipelineName;
                                        targetBranch =
                                            selectOptions[index].name;
                                        envName = env.EnvName;
                                      });
                                    },
                                    child: const Text("Change")),
                              ),
                              DataCell(
                                GFButton(
                                    onPressed: () {
                                      setState(() {
                                        showalert = true;
                                        message = "change and release";
                                        release = true;
                                        pipelineName = env.PipelineName;
                                        targetBranch =
                                            selectOptions[index].name;
                                        envName = env.EnvName;
                                      });
                                    },
                                    child: const Text("Release")),
                              ),
                            ],
                          );
                        },
                      ),
                    ),
            ),
          ],
        ),
      ),
      child: showalert
          ? GFAlert(
              backgroundColor: Theme.of(context).primaryColor,
              type: GFAlertType.rounded,
              title: 'Pipeline Updating',
              width: 700,
              titleTextStyle:
                  const TextStyle(fontSize: 26, color: Colors.white),
              contentTextStyle:
                  const TextStyle(fontSize: 16, color: Colors.white),
              content: "Are you sure to $message this pipeline?",
              bottombar: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: <Widget>[
                  GFButton(
                    onPressed: () {
                      setState(() {
                        showalert = false;
                      });
                      runUpdatePipeline(
                          pipelineName, targetBranch, envName, release);
                    },
                    shape: GFButtonShape.standard,
                    icon: const Icon(Icons.check),
                    child: const Text('Confirm',
                        style: TextStyle(color: Colors.white)),
                  ),
                  const SizedBox(
                    width: 10,
                  ),
                  GFButton(
                    onPressed: () {
                      setState(() {
                        showalert = false;
                      });
                    },
                    shape: GFButtonShape.standard,
                    // position: GFPosition.end,
                    text: 'Cancel',
                    icon: const Icon(Icons.cancel_outlined),
                  )
                ],
              ),
            )
          : const SizedBox(),
    );
  }

  @override
  void didUpdateWidget(covariant InfraModelRow oldWidget) {
    super.didUpdateWidget(oldWidget);
  }
}
