import 'package:flutter/foundation.dart';
import 'package:guide_infra_web_ui/models/user.dto.dart';

class UserProvider with ChangeNotifier {
  User _user = User();

  User get user => _user;

  void setUser(User user) {
    _user = user;
    notifyListeners();
  }
}
