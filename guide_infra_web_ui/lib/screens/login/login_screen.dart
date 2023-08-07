import 'package:flutter/material.dart';
import 'package:guide_infra_web_ui/services/auth_service.dart';
import 'package:guide_infra_web_ui/util/widgets.dart';
import 'package:provider/provider.dart';
// ignore: avoid_web_libraries_in_flutter
import "dart:js" as js;

class Login extends StatefulWidget {
  @override
  _LoginState createState() => _LoginState();
}

class _LoginState extends State<Login> {
  final formKey = GlobalKey<FormState>();
  late String _username = '', _password = '';

  @override
  Widget build(BuildContext context) {
    AuthService auth = Provider.of<AuthService>(context);

    final usernameField = TextFormField(
      autofocus: false,
      // validator: validateEmail,
      onSaved: (value) => _username = value!,
      decoration: buildInputDecoration("Confirm password", Icons.email),
    );

    final passwordField = TextFormField(
      autofocus: false,
      obscureText: true,
      // validator: (value) => value.isEmpty ? "Please enter password" : null,
      onSaved: (value) => _password = value!,
      decoration: buildInputDecoration("Confirm password", Icons.lock),
    );

    var loading = const Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        CircularProgressIndicator(),
        Text(" Authenticating ... Please wait")
      ],
    );

    final forgotLabel = Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: <Widget>[
        TextButton(
          // padding: EdgeInsets.all(0.0),
          child: const Text("Forgot password?",
              style: TextStyle(fontWeight: FontWeight.w300)),
          onPressed: () {},
        ),
      ],
    );

    doLogin() {
      // final form = formKey.currentState;
      //
      // if (form!.validate()) {
      //   form.save();
      //
      // final Future successfulMessage = auth.login(true);

      //
      //
      //   print(successfulMessage);
      //   successfulMessage.then((response) {
      //     print(response);
      //     if (response['status']) {
      //       User user = response['user'];
      //       Provider.of<UserProvider>(context, listen: false).setUser(user);
      //       Navigator.pushReplacementNamed(context, '/dashboard');
      //     }
      //   });
      // } else {
      //   print("form is invalid");
      // }
      final SERVER_URL = dotenv.env['SERVER_HOST'];
      js.context.callMethod(
          'open', [ SERVER_URL + '/oauth/login', '_self']);
    }

    return SafeArea(
      child: Scaffold(
        body: SingleChildScrollView(
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.only(left: 200, right: 200),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 200.0),
                SizedBox(
                  width: 400,
                  child: Form(
                    key: formKey,
                    child: Container(
                      // padding: const EdgeInsets.all(40),
                      // decoration: BoxDecoration(
                      //     border: Border.all(color: Colors.blueAccent)),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 20.0),
                          label("Email"),
                          const SizedBox(height: 5.0),
                          usernameField,
                          const SizedBox(height: 20.0),
                          label("Password"),
                          const SizedBox(height: 5.0),
                          passwordField,
                          const SizedBox(height: 20.0),
                          longButtons("Login", doLogin),
                          const SizedBox(height: 5.0),
                          forgotLabel,
                          const SizedBox(height: 20.0),
                          Container(
                            color: Colors.grey.shade100,
                            height: 1,
                            width: double.infinity,
                          ),
                          const SizedBox(height: 20.0),
                          longButtons("Login with SSO", doLogin),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
