import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../../../models/app_user.dart';
import 'auth_repository.dart';

final sessionProvider =
    StateNotifierProvider<SessionController, AppUser?>((ref) {
  return SessionController(ref);
});

const _mockAuthEnabled = bool.fromEnvironment('MOCK_AUTH');
const _mockUser = AppUser(
  id: '662f00000000000000000001',
  email: 'mock@spenza.local',
  displayName: 'Mock User',
  token: 'mock-local-token',
);

class SessionController extends StateNotifier<AppUser?> {
  SessionController(this._ref) : super(_mockAuthEnabled ? _mockUser : null);

  final Ref _ref;
  final GoogleSignIn _googleSignIn = GoogleSignIn();

  Future<void> loginWithEmail({
    required String email,
    required String password,
  }) async {
    if (email.trim().toLowerCase() == 'mock@spenza.local' &&
        password == 'Mock@1234') {
      state = _mockUser;
      return;
    }

    final user = await _ref.read(authRepositoryProvider).login(
          email: email,
          password: password,
        );
    state = user;
  }

  Future<void> loginWithGoogle() async {
    final account = await _googleSignIn.signIn();
    if (account == null) {
      return;
    }

    final user = await _ref.read(authRepositoryProvider).login(
          email: account.email,
          displayName: account.displayName,
          provider: 'google',
        );
    state = user;
  }

  Future<void> logout() async {
    await _googleSignIn.signOut();
    state = _mockAuthEnabled ? _mockUser : null;
  }
}
