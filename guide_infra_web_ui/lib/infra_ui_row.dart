import 'dart:math';

import 'package:guide_infra_web_ui/pipeline.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';

import 'package:flutter/material.dart';

import 'infra_ui.dto.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

var SERVER_URL = dotenv.env['SERVER_HOST'];

class InfraModelRow extends StatefulWidget {
  const InfraModelRow({super.key, required this.infraData});

  final InfrastructureBranchModel infraData;

  @override
  State<InfraModelRow> createState() => _InfraModelRowState();
}

class _InfraModelRowState extends State<InfraModelRow> {
  List<OptionModel> s3Objectlist = [OptionModel(name: "empty", code: 1)];
  OptionModel? dropdownValue;
  // OptionModel(name: "empty", code: -1); //s3Objectlist1[0];

  Future getAllCategory() async {
    var baseUrl = "$SERVER_URL/s3";

    http.Response response = await http.get(Uri.parse(baseUrl));

    if (response.statusCode == 200) {
      final jsonData = json.decode(response.body);

      final tmp = ((jsonData as dynamic) as List<dynamic>).map((dynamic item) {
        final mapObject = item as Map<String, dynamic>;
        return OptionModel(code: mapObject["index"], name: mapObject["value"]);
      }).toList();
      final sd = tmp.firstWhere((element) {
        return element.name == widget.infraData.TargetBranch;
      }, orElse: () => OptionModel(name: "empty", code: -1));
      setState(() {
        dropdownValue = sd;
        s3Objectlist = tmp;
      });
    }
  }

  Future updatePipeline(pipelineName, targetBranch) async {
    if (pipelineName != "" && targetBranch != "") {
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
      }
    }
  }

  abc() async {
    await getAllCategory();
  }

  abc1(pipelineName, targetBranch) async {
    await updatePipeline(pipelineName, targetBranch);
  }

  @override
  initState() {
    super.initState();
    abc();
  }

  @override
  Widget build(BuildContext context) {
    var env =
        widget.infraData.EnvName.isNotEmpty ? widget.infraData.EnvName : "";
    return SizedBox(
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Row(
          // mainAxisAlignment: MainAxisAlignment.spaceAround,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(env),
            const SizedBox(
              width: 50,
            ),
            DropdownButton<OptionModel>(
              value: dropdownValue,
              icon: const Icon(Icons.arrow_downward),
              elevation: 16,
              style: const TextStyle(color: Colors.deepPurple),
              underline: Container(
                height: 2,
                color: Colors.deepPurpleAccent,
              ),
              onChanged: (OptionModel? newValue) {
                setState(() {
                  dropdownValue = newValue!;
                });
              },
              items: s3Objectlist
                  .map<DropdownMenuItem<OptionModel>>((OptionModel value) {
                return DropdownMenuItem<OptionModel>(
                  value: value,
                  child: Text(value.name),
                );
              }).toList(),
            ),
            const SizedBox(
              width: 50,
            ),
            ElevatedButton(
                onPressed: () =>
                    {abc1(widget.infraData.PipelineName, dropdownValue?.name)},
                child: const Text("change"))
          ],
        ),
      ),
    );
  }
}
