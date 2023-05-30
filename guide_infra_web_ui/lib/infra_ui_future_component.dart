import 'package:flutter/material.dart';

import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';

import 'infra_ui.dto.dart';
import 'infra_ui_row.dart';
import 'package:getwidget/getwidget.dart';

class FutureBuilderExample extends StatefulWidget {
  const FutureBuilderExample({super.key});
  @override
  State<FutureBuilderExample> createState() => _FutureBuilderExampleState();
}

class _FutureBuilderExampleState extends State<FutureBuilderExample> {
  Future<List<InfrastructureBranchModel>> getAllEnv() async {
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
      }).toList();
      return tmp;
    }
    return [];
  }

  Future<List<OptionModel>> getAllCategory() async {
    var baseUrl = "$SERVER_URL/s3";

    http.Response response = await http.get(Uri.parse(baseUrl));

    if (response.statusCode == 200) {
      final jsonData = json.decode(response.body);

      var s3Objectlist =
          ((jsonData as dynamic) as List<dynamic>).map((dynamic item) {
        final mapObject = item as Map<String, dynamic>;
        return OptionModel(code: mapObject["index"], name: mapObject["value"]);
      }).toList();
      return s3Objectlist;
    }
    return [];
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTextStyle(
      style: Theme.of(context).textTheme.displayMedium!,
      textAlign: TextAlign.center,
      child: FutureBuilder<List<dynamic>>(
        future: Future.wait([
          getAllEnv(),
          getAllCategory()
        ]), // a previously-obtained Future<String> or null
        builder: (BuildContext context, AsyncSnapshot<List<dynamic>> snapshot) {
          List<Widget> children;
          if (snapshot.hasData) {
            return snapshot.connectionState == ConnectionState.waiting
                ? const CircularProgressIndicator()
                : Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: List.generate(
                      snapshot.data?[0]!.length,
                      (index) {
                        return InfraModelRow(
                            infraData: snapshot.data?[0][index],
                            dropdowList: snapshot.data?[1]);
                      },
                    ),
                  );
          } else if (snapshot.hasError) {
            children = <Widget>[
              const Icon(
                Icons.error_outline,
                color: Colors.red,
                size: 60,
              ),
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: Text('Error: ${snapshot.error}'),
              ),
            ];
          } else {
            children = const <Widget>[
              Padding(
                padding: EdgeInsets.only(top: 16),
                child: GFLoader(type: GFLoaderType.circle),
              ),
            ];
          }
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: children,
            ),
          );
        },
      ),
    );
  }
}
