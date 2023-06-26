import 'package:guide_infra_web_ui/models/user.dto.dart';
import 'package:shared_preferences/shared_preferences.dart';

class UserPreferences {
  Future<bool> saveUser(User user) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();

    prefs.setInt("userId", user.userId ?? 0);
    prefs.setString("username", user.username ?? "");
    prefs.setString("email", user.email ?? "");
    prefs.setString("phone", user.phone ?? "");
    prefs.setString("type", user.type ?? "");
    prefs.setString("accessToken", user.accessToken ?? "");

    return prefs.commit();
  }

  Future<User> getUser() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();

    int? userId = prefs.getInt("userId");
    String? username = prefs.getString("username");
    String? email = prefs.getString("email");
    String? resourceAccess = prefs.getString("resourceAccess");
    String? realmAccess = prefs.getString("realmAccess");
    String? type = prefs.getString("type");
    String? accessToken = prefs.getString("accessToken");

    return User(
      userId: userId,
      username: username,
      email: email,
      resourceAccess: resourceAccess,
      realmAccess: realmAccess,
      type: type,
      accessToken: accessToken,
    );
  }

  void removeUser() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();

    prefs.remove("name");
    prefs.remove("email");
    prefs.remove("phone");
    prefs.remove("accessToken");
  }

  Future<String?> getToken(args) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString("accessToken");
    return token;
  }
}
