import 'package:flutter/material.dart';

import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';

import '../../../models/infra_ui.dto.dart';
import 'pipeline_row.dart';

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

  bool _loadSuccess = false;

  List<OptionModel> optionModels = [OptionModel(code: -1, name: '')];

  List<InfrastructureBranchModel> listTemps = [
    InfrastructureBranchModel(TargetBranch: "")
  ];

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
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      try {
        final results = await Future.wait([getAllCategory(), getAllEnv()]);
        optionModels = results[0] as List<OptionModel>;
        optionModels.add(OptionModel(code: -1, name: ''));
        listTemps = results[1] as List<InfrastructureBranchModel>;

        _loadSuccess = true;
        setState(() {});
      } catch (ex) {}
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    var marginTop = MediaQuery.of(context).size.height * 0.35;
    print(optionModels.length);
    return DefaultTextStyle(
        style: Theme.of(context).textTheme.displayMedium!,
        textAlign: TextAlign.center,
        child: !_loadSuccess
            ? CircularProgressIndicator()
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


// FutureBuilder<List<dynamic>>(
//         future: Future.wait([
//           getAllEnv(),
//           getAllCategory()
//         ]), // a previously-obtained Future<String> or null
//         builder: (BuildContext context, AsyncSnapshot<List<dynamic>> snapshot) {
//           List<Widget> children;
//           if (snapshot.hasData) {
//             return snapshot.connectionState == ConnectionState.waiting
//                 ? const Center(
//                     child: CircularProgressIndicator(
//                       strokeWidth: 20,
//                     ),
//                   )
//                 : Column(
//                     mainAxisAlignment: MainAxisAlignment.center,
//                     mainAxisSize: MainAxisSize.min,
//                     children: [
//                       InfraModelRow(
//                           infraData: snapshot.data?[0],
//                           dropdowList: snapshot.data?[1]),
//                     ],
//                   );
//           } else if (snapshot.hasError) {
//             children = <Widget>[
//               const Icon(
//                 Icons.error_outline,
//                 color: Colors.red,
//                 size: 60,
//               ),
//               const Padding(
//                 padding: EdgeInsets.only(top: 16),
//                 child: Text('Error: Cannot connect to server!'),
//               ),
//             ];
//           } else {
//             children = <Widget>[
//               Padding(
//                 padding: EdgeInsets.only(top: marginTop),
//                 child: const GFLoader(type: GFLoaderType.circle),
//               ),
//             ];
//           }
//           return Center(
//             child: Column(
//               mainAxisAlignment: MainAxisAlignment.center,
//               children: children,
//             ),
//           );
//         },
//       ),