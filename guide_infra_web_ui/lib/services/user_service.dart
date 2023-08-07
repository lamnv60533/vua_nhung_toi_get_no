import 'package:flutter/material.dart';

class UserService with ChangeNotifier {
  String username = '';
  List<String> roles = [];

  UserService();

  set userName(String username) {
    this.username = username;
    notifyListeners();
  }

  setRoles(List<String> roles) {
    this.roles = roles;
  }

  setUserInfo(String username, List<String> roles) {
    this.username = username;
    this.roles = roles;
    notifyListeners();
  }
}
