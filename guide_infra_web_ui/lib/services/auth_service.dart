import 'dart:async';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:guide_infra_web_ui/models/user.dto.dart';
import 'package:guide_infra_web_ui/services/api.dart';
import 'package:guide_infra_web_ui/services/logger.dart';
import 'package:guide_infra_web_ui/services/storage.dart';

class AuthService {
  final StreamController<bool> _onAuthStateChange =
      StreamController.broadcast();
  final StreamController<User> _onUserInfoChange = StreamController.broadcast();
  final SERVER_URL = dotenv.env['SERVER_HOST'];
  final logger = LogService().logger;
  final StorageService _storage = StorageService();
  Stream<bool> get onAuthStateChange => _onAuthStateChange.stream;
  Stream<User> get onUserInfoChange => _onUserInfoChange.stream;

  Future<bool> login(String? state) async {
    if (state != null) {
      final api = Api();
      final di0 = api.api;

      var url = "$SERVER_URL/oauth/verify-token";
      try {
        final response = await di0.post(url, data: {'token': state});
        if (response.statusCode == 201) {
          var accessToken = response.data['data']['access_token'];
          await _storage.setAccessToken(accessToken);
          _onAuthStateChange.add(true);
          final user = User(username: "liam", roles: [
            "guide-infra-admin",
            "guide-infra-user",
            "uma_protection"
          ]);
          _onUserInfoChange.add(user);
          return true;
        }
      } catch (e) {
        logger.e("Error: $e");

        if (e is ForbiddenException) {
          await _storage.removeStorageValue("accessToken");
        }
      }
    }
    _onAuthStateChange.add(false);
    return false;
  }

  Future<void> logOut() async {
    await _storage.removeStorageValue("accessToken");
    _onAuthStateChange.add(false);
  }
}
