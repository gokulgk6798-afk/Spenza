import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../../models/parse_result.dart';
import '../../../models/transaction_record.dart';
import '../../auth/data/session_controller.dart';

final transactionsRepositoryProvider = Provider<TransactionsRepository>((ref) {
  return TransactionsRepository(ref.watch(apiClientProvider), ref);
});

class TransactionsRepository {
  TransactionsRepository(this._dio, this._ref);

  final Dio _dio;
  final Ref _ref;

  Options get _authOptions => Options(
        headers: {
          'Authorization': 'Bearer ${_ref.read(sessionProvider)?.token}',
        },
      );

  Future<List<TransactionRecord>> fetchTransactions({
    String? category,
  }) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/transactions',
      queryParameters: {
        if (category != null && category != 'all') 'category': category,
      },
      options: _authOptions,
    );

    final items = (response.data?['transactions'] as List<dynamic>? ?? [])
        .map((item) => TransactionRecord.fromJson(item as Map<String, dynamic>))
        .toList();
    return items;
  }

  Future<ParseResult> parseTransactionText(String text) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/transactions/parse',
      data: {'text': text},
      options: _authOptions,
    );

    return ParseResult.fromJson(response.data ?? {});
  }

  Future<TransactionRecord> createTransaction({
    required double amount,
    required String type,
    required String category,
    required String vendor,
    required String rawText,
    required String source,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/transactions',
      data: {
        'amount': amount,
        'type': type,
        'category': category,
        'vendor': vendor,
        'rawText': rawText,
        'source': source,
      },
      options: _authOptions,
    );

    return TransactionRecord.fromJson(
      response.data?['transaction'] as Map<String, dynamic>,
    );
  }
}

