import 'package:flutter/material.dart';

class DialogExample extends StatelessWidget {
  const DialogExample({super.key, required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      content: Text(message),
      actions: <Widget>[
        TextButton(
          onPressed: () => Navigator.pop(context, 'Cancel'),
          child: const Text('Cancel'),
        ),
        TextButton(
          onPressed: () => Navigator.pop(context, 'OK'),
          child: const Text('OK'),
        ),
      ],
    );
  }
}
