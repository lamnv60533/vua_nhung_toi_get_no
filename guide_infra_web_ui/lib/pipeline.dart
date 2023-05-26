import 'dart:developer';

import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'package:flutter/material.dart';

class DropdownDemo extends StatefulWidget {
  const DropdownDemo({Key? key}) : super(key: key);
  @override
  State<DropdownDemo> createState() => _DropdownDemoState();
}

class _DropdownDemoState extends State<DropdownDemo> {
  List<OptionModel> s3Objectlist = [
    OptionModel(name: "kc-member-site-src.develop", code: 1)
  ];

  late OptionModel dropdownValue;

  Future getAllCategory() async {
    var baseUrl = "http://localhost:3000/api/v1/s3";

    http.Response response = await http.get(Uri.parse(baseUrl));

    if (response.statusCode == 200) {
      var jsonData = json.decode(response.body);

      var tmp = ((jsonData as dynamic) as List<dynamic>).map((dynamic item) {
        final mapObject = item as Map<String, dynamic>;
        return OptionModel(code: mapObject["index"], name: mapObject["value"]);
      });
      setState(() {
        s3Objectlist = tmp.toList();
        dropdownValue = s3Objectlist[0];
      });
    }
  }

  abc() async {
    await getAllCategory();
  }

  @override
  initState() {
    super.initState();
    abc();
    // s3Objectlist = [
    //   OptionModel(name: "kc-member-site-src.develop", code: 1),
    //   OptionModel(name: "kc-member-site-src.develop-a", code: 2),
    // ].toList();
    dropdownValue = OptionModel(name: "kc-member-site-src.develop", code: 1);
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      // mainAxisAlignment: MainAxisAlignment.spaceAround,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Text("env-1"),
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
        ElevatedButton(onPressed: () => {}, child: const Text("change"))
      ],
    );
  }
}

class OptionModel {
  int code;
  String name;

  OptionModel({
    this.code = 0,
    this.name = "",
  });
}
