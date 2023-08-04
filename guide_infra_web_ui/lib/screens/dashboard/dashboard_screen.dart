import 'package:flutter/material.dart';
import 'package:guide_infra_web_ui/screens/dashboard/components/pipeline_configuration.dart';
import 'package:guide_infra_web_ui/responsive.dart';
import 'package:guide_infra_web_ui/screens/header.dart';
import '../../constants.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        primary: false,
        padding: const EdgeInsets.all(defaultPadding),
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
                      const SizedBox(height: defaultPadding),
                      const InfraBranchListWidget(),
                      if (Responsive.isMobile(context))
                        const SizedBox(height: defaultPadding),
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
