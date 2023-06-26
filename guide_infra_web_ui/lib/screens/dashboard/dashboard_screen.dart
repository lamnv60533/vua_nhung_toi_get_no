import 'package:flutter/material.dart';
import 'package:guide_infra_web_ui/controllers/AuthenticationController.dart';
import 'package:guide_infra_web_ui/models/user.dto.dart';
import 'package:guide_infra_web_ui/screens/dashboard/components/pipeline_configuration.dart';
import 'package:guide_infra_web_ui/responsive.dart';
import 'package:guide_infra_web_ui/screens/header.dart';
import 'package:provider/provider.dart';

import '../../constants.dart';

class DashboardScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    User user = Provider.of<UserProvider>(context).user;
    return SafeArea(
      child: SingleChildScrollView(
        primary: false,
        padding: EdgeInsets.all(defaultPadding),
        child: Column(
          children: [
            const Header(),
            const SizedBox(height: defaultPadding),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  flex: 5,
                  child: Column(
                    children: [
                      // MyFiles(),
                      SizedBox(height: defaultPadding),
                      FutureBuilderExample(),
                      if (Responsive.isMobile(context))
                        SizedBox(height: defaultPadding),
                    ],
                  ),
                ),
                if (!Responsive.isMobile(context))
                  const SizedBox(width: defaultPadding),
              ],
            )
          ],
        ),
      ),
    );
  }
}
