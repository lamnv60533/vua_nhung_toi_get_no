import 'package:flutter/material.dart';
import 'package:guide_infra_web_ui/controllers/MenuAppController.dart';
import 'package:guide_infra_web_ui/responsive.dart';
import 'package:guide_infra_web_ui/screens/dashboard/dashboard_screen.dart';
import 'package:provider/provider.dart';

import 'components/side_menu.dart';

class MainScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: context.read<MenuAppController>().scaffoldKey,
      drawer: const SideMenu(),
      body: SafeArea(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // We want this side menu only for large screen
            if (Responsive.isDesktop(context))
              const Expanded(
                // default flex = 1
                // and it takes 1/6 part of the screen
                child: SideMenu(),
              ),
            Expanded(
              // It takes 5/6 part of the screen
              flex: 7,
              child: DashboardScreen(),
            ),
          ],
        ),
      ),
    );
  }
}
