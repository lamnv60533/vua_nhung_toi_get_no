import 'dart:async';

import 'package:dio/dio.dart';
import 'package:guide_infra_web_ui/services/storage.dart';

class Api {
  final Dio api = Dio();
  final StreamController<bool> _onAuthStateChange =
      StreamController.broadcast();
  final StorageService _storage = StorageService();

  Api() {
    api.interceptors
        .add(InterceptorsWrapper(onRequest: (options, handler) async {
      var accessToken = await _storage.getAccessToken();
      if (accessToken != "") {
        options.headers['Authorization'] = 'Bearer $accessToken';
      }
      options.headers['Content-Type'] = 'application/json; charset=UTF-8';
      return handler.next(options);
    }, onError: (DioException error, handler) async {
      if ((error.response?.statusCode == 401)) {
        // if (await _storage.containsKey(key: 'refreshToken')) {
        //   if (await refreshToken()) {
        //     return handler.resolve(await _retry(error.requestOptions));
        //   }
        // }

        _storage.removeStorageValue("accessToken");
        _onAuthStateChange.add(false);
      }
      return handler.next(error);
    }));
  }

  Future<Response<dynamic>> _retry(RequestOptions requestOptions) async {
    final options = Options(
      method: requestOptions.method,
      headers: requestOptions.headers,
    );
    return api.request<dynamic>(requestOptions.path,
        data: requestOptions.data,
        queryParameters: requestOptions.queryParameters,
        options: options);
  }

  // Future<bool> refreshToken() async {
  //   final refreshToken = await _storage.read(key: 'refreshToken');
  //   final response =
  //       await api.post('/auth/refresh', data: {'refreshToken': refreshToken});

  //   if (response.statusCode == 201) {
  //     accessToken = response.data;
  //     return true;
  //   } else {
  //     // refresh token is wrong
  //     accessToken = null;
  //     _storage.deleteAll();
  //     return false;
  //   }
  // }
}
