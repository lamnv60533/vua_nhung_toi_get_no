import 'dart:async';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:guide_infra_web_ui/services/api.dart';
import 'package:guide_infra_web_ui/services/logger.dart';

class AuthService {
  final StreamController<bool> _onAuthStateChange =
      StreamController.broadcast();
  final SERVER_URL = dotenv.env['SERVER_HOST'];
  final logger = LogService().logger;

  Stream<bool> get onAuthStateChange => _onAuthStateChange.stream;

  Future<bool> login(String? state) async {
    if (state != null) {
      final api = Api();
      final di0 = api.api;

      var url = "$SERVER_URL/oauth/verify-token";
      try {
        final response = await di0.post(url, data: {'token': state});
        if (response.statusCode == 201) {
          _onAuthStateChange.add(true);
          var accessToken = response.data['data']['access_token'];
          api.setAccessToken(accessToken);
          return true;
        }
      } catch (e) {
        logger.e("Error: $e");
      }
    }
    _onAuthStateChange.add(false);
    return false;
  }

  void logOut() {
    _onAuthStateChange.add(false);
  }
}
