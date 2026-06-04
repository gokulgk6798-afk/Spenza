import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../../models/dashboard_summary.dart';
import '../../../models/transaction_record.dart';
import '../../auth/data/session_controller.dart';

final dashboardRepositoryProvider = Provider<DashboardRepository>((ref) {
  return DashboardRepository(ref.watch(apiClientProvider), ref);
});

class DashboardRepository {
  DashboardRepository(this._dio, this._ref);

  final Dio _dio;
  final Ref _ref;

  Future<DashboardSummary> fetchDashboard() async {
    final token = _ref.read(sessionProvider)?.token;
    if (token == 'mock-local-token') {
      return DashboardSummary(
        totalIncome: 85000,
        totalExpense: 24850,
        balance: 60150,
        safety: const SafetySummary(
          status: 'healthy',
          message: 'You are within this month\'s safe spending range.',
          expenseRatio: 29,
          savings: 60150,
        ),
        insights: const [
          'Food and groceries are your highest spend this week.',
          'You saved more than 70% of income this month.',
          'Recurring bills are stable compared with last month.',
        ],
        recentTransactions: [
          TransactionRecord(
            id: 'mock-transaction-1',
            amount: 250,
            type: 'expense',
            category: 'groceries',
            vendor: 'Blinkit',
            timestamp: DateTime.now().subtract(const Duration(hours: 3)),
            source: 'chat',
            mergeCount: 1,
          ),
          TransactionRecord(
            id: 'mock-transaction-2',
            amount: 1200,
            type: 'expense',
            category: 'food',
            vendor: 'Swiggy',
            timestamp: DateTime.now().subtract(const Duration(days: 1)),
            source: 'notification',
            mergeCount: 1,
          ),
        ],
      );
    }

    final response = await _dio.get<Map<String, dynamic>>(
      '/dashboard',
      options: Options(
        headers: {
          'Authorization': 'Bearer $token',
        },
      ),
    );
    return DashboardSummary.fromJson(response.data ?? {});
  }
}

final dashboardProvider = FutureProvider<DashboardSummary>((ref) async {
  return ref.watch(dashboardRepositoryProvider).fetchDashboard();
});
