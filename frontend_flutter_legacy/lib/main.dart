import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/theme/app_theme.dart';
import 'features/auth/data/session_controller.dart';
import 'features/auth/presentation/auth_screen.dart';
import 'features/dashboard/presentation/home_shell.dart';

void main() {
  runApp(const ProviderScope(child: SpenzaApp()));
}

class SpenzaApp extends ConsumerWidget {
  const SpenzaApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(sessionProvider);

    return MaterialApp(
      title: 'Spenza',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      home: user == null ? const AuthScreen() : const HomeShell(),
    );
  }
}

