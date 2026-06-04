import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../../models/insights_data.dart';
import '../../auth/data/session_controller.dart';

final insightsRepositoryProvider = Provider<InsightsRepository>((ref) {
  return InsightsRepository(ref.watch(apiClientProvider), ref);
});

class InsightsRepository {
  InsightsRepository(this._dio, this._ref);

  final Dio _dio;
  final Ref _ref;

  Future<InsightsData> fetchInsights() async {
    final token = _ref.read(sessionProvider)?.token;
    final response = await _dio.get<Map<String, dynamic>>(
      '/insights',
      options: Options(
        headers: {
          'Authorization': 'Bearer $token',
        },
      ),
    );
    return InsightsData.fromJson(response.data ?? {});
  }
}

final insightsProvider = FutureProvider<InsightsData>((ref) async {
  return ref.watch(insightsRepositoryProvider).fetchInsights();
});

