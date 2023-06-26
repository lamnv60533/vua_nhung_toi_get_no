import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:guide_infra_web_ui/models/user.dto.dart';
import 'package:guide_infra_web_ui/util/app_url.dart';
import 'package:guide_infra_web_ui/util/shared_preference.dart';
import 'package:http/http.dart';

enum Status {
  NotLoggedIn,
  NotRegistered,
  LoggedIn,
  Registered,
  Authenticating,
  Registering,
  LoggedOut
}

class AuthProvider with ChangeNotifier {
  Status _loggedInStatus = Status.NotLoggedIn;
  Status _registeredInStatus = Status.NotRegistered;

  Status get loggedInStatus => _loggedInStatus;
  Status get registeredInStatus => _registeredInStatus;

  Future login(String email, String password) async {
    var result;

    final Map<String, dynamic> loginData = {
      'username': email,
      'password': password
    };

    _loggedInStatus = Status.Authenticating;
    notifyListeners();
    try {
      var response = await post(
          Uri.parse("http://localhost:3000/api/v1/oauth/login"),
          body: {"username": "lamnv60533@gmail.com", "password": "Abc123"});

      if (response.statusCode == 201) {
        final Map<String, dynamic> responseData = json.decode(response.body);
        print(response);
        print(responseData);

        User authUser = User.fromJson(responseData);
        print(authUser);

        UserPreferences().saveUser(authUser);
        _loggedInStatus = Status.LoggedIn;
        notifyListeners();
        result = {'status': true, 'message': 'Successful', 'user': authUser};
      } else {
        _loggedInStatus = Status.NotLoggedIn;
        notifyListeners();
        result = {
          'status': false,
          'message': json.decode(response.body)['error']
        };
      }
    } catch (error) {
      print("========= $error");
    }
    return result;
  }

  static Future<FutureOr> onValue(Response response) async {
    var result;
    final Map<String, dynamic> responseData = json.decode(response.body);

    print(response.statusCode);
    if (response.statusCode == 200) {
      var userData = responseData['data'];

      User authUser = User.fromJson(userData);

      UserPreferences().saveUser(authUser);
      result = {
        'status': true,
        'message': 'Successfully registered',
        'data': authUser
      };
    } else {
//      if (response.statusCode == 401) Get.toNamed("/login");
      result = {
        'status': false,
        'message': 'Registration failed',
        'data': responseData
      };
    }

    return result;
  }

  static onError(error) {
    print("the error is $error.detail");
    return {'status': false, 'message': 'Unsuccessful Request', 'data': error};
  }
}
