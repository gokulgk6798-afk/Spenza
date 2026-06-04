import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../../models/app_user.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ref.watch(apiClientProvider));
});

class AuthRepository {
  AuthRepository(this._dio);

  final Dio _dio;

  Future<AppUser> login({
    required String email,
    String? password,
    String provider = 'email',
    String? displayName,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/auth/login',
      data: {
        'email': email,
        'password': password,
        'provider': provider,
        'displayName': displayName,
      },
    );

    final data = response.data ?? <String, dynamic>{};
    return AppUser.fromJson(
      data['user'] as Map<String, dynamic>,
      data['token'] as String,
    );
  }
}

