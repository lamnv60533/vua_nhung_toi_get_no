import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:guide_infra_web_ui/route/route_utils.dart';
import 'package:guide_infra_web_ui/screens/error/error_page.dart';
import 'package:guide_infra_web_ui/screens/login/login_screen.dart';
import 'package:guide_infra_web_ui/screens/main/main_screen.dart';
import 'package:guide_infra_web_ui/screens/login-success/loggin_success.dart';
import 'package:guide_infra_web_ui/services/app_service.dart';

class AppRouter {
  late final AppService appService;
  GoRouter get router => _goRouter;

  AppRouter(this.appService);

  late final GoRouter _goRouter = GoRouter(
    debugLogDiagnostics: true,
    refreshListenable: appService,
    initialLocation: APP_PAGE.home.toPath,
    routes: <GoRoute>[
      GoRoute(
        path: APP_PAGE.home.toPath,
        name: APP_PAGE.home.toName,
        builder: (context, state) => const MainScreen(),
      ),
      GoRoute(
          path: APP_PAGE.splash.toPath,
          name: APP_PAGE.splash.toName,
          builder: (context, GoRouterState state) {
            return LoginSuccessPage(stateId: state.queryParameters['state']);
          }),
      GoRoute(
        path: APP_PAGE.login.toPath,
        name: APP_PAGE.login.toName,
        builder: (context, state) => Login(),
      ),
      GoRoute(
        path: APP_PAGE.error.toPath,
        name: APP_PAGE.error.toName,
        builder: (context, state) => ErrorPage(error: state.extra.toString()),
      ),
    ],
    // errorBuilder: (context, state) => ErrorPage(error: state.error.toString()),
    redirect: (BuildContext context, GoRouterState state) {
      // context.watch<AppService>();
      final loginLocation = state.namedLocation(APP_PAGE.login.toName);
      final homeLocation = state.namedLocation(APP_PAGE.home.toName);
      final splashLocation = state.namedLocation(APP_PAGE.splash.toName);

      final isLogedIn = appService.loginState;
      final isInitialized = appService.initialized;

      if (!isInitialized) {
        var stateId = state.queryParameters['state'];
        if (stateId != null) {
          return "$splashLocation?state=$stateId";
        }
        return splashLocation;
        // If all the scenarios are cleared but still going to any of that screen redirect to Home
      } else if ((isInitialized && !isLogedIn)) {
        return loginLocation;
      } else if ((isLogedIn)) {
        return homeLocation;
      } else {
        // Else Don't do anything
        return null;
      }
    },
  );
}
