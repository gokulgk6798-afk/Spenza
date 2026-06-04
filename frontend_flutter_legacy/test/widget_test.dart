import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:spenza/main.dart';

void main() {
  testWidgets('renders auth screen when no user session exists', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: SpenzaApp()));

    expect(find.text('Spenza'), findsOneWidget);
    expect(find.text('Continue with Email'), findsOneWidget);
  });
}
