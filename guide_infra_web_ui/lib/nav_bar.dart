import 'package:flutter/material.dart';
import 'package:getwidget/getwidget.dart';

class NavBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        children: [
          const GFAvatar(
            backgroundImage: NetworkImage(
                "https://oflutter.com/wp-content/uploads/2021/02/girl-profile.png"),
          ),
          ListTile(
            leading: Icon(Icons.favorite),
            title: Text('Favorites'),
            onTap: () => null,
          ),
        ],
      ),
    );
  }
}
