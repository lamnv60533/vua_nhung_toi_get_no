import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:guide_infra_web_ui/controllers/AuthenticationController.dart';
import 'package:guide_infra_web_ui/models/user.dto.dart';
import 'package:guide_infra_web_ui/providers/auth.dart';
import 'package:guide_infra_web_ui/screens/login/login_screen.dart';
import 'package:guide_infra_web_ui/screens/main/main_screen.dart';
import 'package:guide_infra_web_ui/util/shared_preference.dart';
import 'package:provider/provider.dart';
import 'constants.dart';
import 'controllers/MenuAppController.dart';
import 'package:keycloak_flutter/keycloak_flutter.dart';
import 'package:flutter_web_plugins/url_strategy.dart';

late KeycloakService keycloakService;

Future<void> main() async {
  await dotenv.load(fileName: ".env");
  usePathUrlStrategy();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: bgColor,
        textTheme: GoogleFonts.poppinsTextTheme(Theme.of(context).textTheme)
            .apply(bodyColor: Colors.white),
        canvasColor: secondaryColor,
      ),
      home: const MyHomePage(title: ''),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  @override
  Widget build(BuildContext context) {
    Future<User> getUserData() => UserPreferences().getUser();
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (context) => MenuAppController(),
        ),
        ChangeNotifierProvider(
          create: (context) => AuthProvider(),
        ),
        ChangeNotifierProvider(
          create: (context) => UserProvider(),
        ),
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'Guide Infrastructure Management',
        theme: ThemeData.dark().copyWith(
          scaffoldBackgroundColor: bgColor,
          textTheme: GoogleFonts.poppinsTextTheme(Theme.of(context).textTheme)
              .apply(bodyColor: Colors.white),
          canvasColor: secondaryColor,
        ),
        home: FutureBuilder(
            future: getUserData(),
            builder: (context, snapshot) {
              switch (snapshot.connectionState) {
                case ConnectionState.none:
                case ConnectionState.waiting:
                  return const CircularProgressIndicator();
                default:
                  if (snapshot.hasError) {
                    return Text('Error: ${snapshot.error}');
                  } else if (snapshot.data?.accessToken == null) {
                    return Login();
                  } else {
                    UserPreferences().removeUser();
                  }
                  return MainScreen();
              }
            }),
        initialRoute: '/',
        onGenerateRoute: (RouteSettings settings) {
          switch (settings.name) {
            case '/':
              return MaterialPageRoute(
                settings: settings,
                builder: (context) => MainScreen(),
              );
            case '/dashboard':
              return MaterialPageRoute(
                settings: settings,
                builder: (context) => MainScreen(),
              );
            case '/login':
              return MaterialPageRoute(
                settings: settings,
                builder: (context) => Login(),
              );
            default:
              return MaterialPageRoute(builder: (_) {
                return MainScreen();
              });
          }
        },
      ),
    );
  }
}
