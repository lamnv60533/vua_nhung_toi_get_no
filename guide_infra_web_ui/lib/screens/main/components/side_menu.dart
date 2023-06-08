import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class SideMenu extends StatelessWidget {
  const SideMenu({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Drawer(
      width: 10,
      child: ListView(
        children: [
          DrawerHeader(
            child: Image.asset(
              "assets/images/logo-1.png",
              height: 40,
            ),
          ),
          ExpandedListTile(
            title: "Dashboard",
            svgSrc: "assets/icons/menu_dashboard.svg",
            press: () {},
            emptyList: false,
            child: const [
              Padding(
                padding: EdgeInsets.only(left: 30),
                child: Text(
                  "kc-membersite-renewal",
                  style: TextStyle(color: Colors.white54, fontSize: 14),
                ),
              ),
            ],
          ),
          ExpandedListTile(
            title: "Profile",
            svgSrc: "assets/icons/menu_profile.svg",
            press: () {},
            emptyList: true,
          ),
          ExpandedListTile(
            title: "Settings",
            svgSrc: "assets/icons/menu_setting.svg",
            press: () {},
            emptyList: true,
          ),
        ],
      ),
    );
  }
}

class DrawerListTile extends StatelessWidget {
  const DrawerListTile({
    Key? key,
    // For selecting those three line once press "Command+D"
    required this.title,
    required this.svgSrc,
    required this.press,
  }) : super(key: key);

  final String title, svgSrc;
  final VoidCallback press;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: press,
      horizontalTitleGap: 0.0,
      leading: SvgPicture.asset(
        svgSrc,
        colorFilter: const ColorFilter.mode(Colors.white54, BlendMode.srcIn),
        height: 16,
      ),
      title: Text(
        title,
        style: const TextStyle(color: Colors.white54),
      ),
      // trailing: Text(
      //   title,
      //   style: const TextStyle(color: Colors.white54),
      // ),
    );
  }
}

class ExpandedListTile extends StatelessWidget {
  const ExpandedListTile(
      {Key? key,
      // For selecting those three line once press "Command+D"
      required this.title,
      required this.svgSrc,
      required this.press,
      this.child,
      required this.emptyList})
      : super(key: key);

  final String title, svgSrc;
  final VoidCallback press;
  final List<Widget>? child;
  final bool emptyList;

  @override
  Widget build(BuildContext context) {
    return ExpansionTile(
      initiallyExpanded: true,
      trailing: emptyList ? const SizedBox.shrink() : null,
      title: Container(
        child: Row(
          children: [
            SizedBox(
              width: 20,
              child: SvgPicture.asset(
                svgSrc,
                colorFilter:
                    const ColorFilter.mode(Colors.white54, BlendMode.srcIn),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(left: 10),
              child: Text(
                title,
                style: const TextStyle(color: Colors.white54),
              ),
            ),
          ],
        ),
      ),
      children: child ?? [const SizedBox.shrink()],
    );
  }
}
