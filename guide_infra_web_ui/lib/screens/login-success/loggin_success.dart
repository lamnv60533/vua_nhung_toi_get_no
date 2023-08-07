import 'package:flutter/material.dart';
import 'package:guide_infra_web_ui/services/app_service.dart';
import 'package:guide_infra_web_ui/services/auth_service.dart';
import 'package:provider/provider.dart';

class LoginSuccessPage extends StatefulWidget {
  const LoginSuccessPage({super.key, this.stateId});
  final String? stateId;

  @override
  _LoginSuccessPageState createState() => _LoginSuccessPageState();
}

class _LoginSuccessPageState extends State<LoginSuccessPage> {
  @override
  void initState() {
    onStartUp();
    super.initState();
  }

  void onStartUp() async {
    var state = widget.stateId;
    await Provider.of<AuthService>(context, listen: false).login(state);
    await Provider.of<AppService>(context, listen: false).onAppStart();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
          // title: Text(APP_PAGE.splash.toTitle),
          ),
      body: const Center(
        child: CircularProgressIndicator(),
      ),
    );
  }
}
