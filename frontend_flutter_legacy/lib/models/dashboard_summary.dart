import 'transaction_record.dart';

class SafetySummary {
  const SafetySummary({
    required this.status,
    required this.message,
    required this.expenseRatio,
    required this.savings,
  });

  final String status;
  final String message;
  final double expenseRatio;
  final double savings;

  factory SafetySummary.fromJson(Map<String, dynamic> json) {
    return SafetySummary(
      status: json['status'] as String? ?? 'healthy',
      message: json['message'] as String? ?? '',
      expenseRatio: (json['expenseRatio'] as num?)?.toDouble() ?? 0,
      savings: (json['savings'] as num?)?.toDouble() ?? 0,
    );
  }
}

class DashboardSummary {
  const DashboardSummary({
    required this.totalIncome,
    required this.totalExpense,
    required this.balance,
    required this.safety,
    required this.insights,
    required this.recentTransactions,
  });

  final double totalIncome;
  final double totalExpense;
  final double balance;
  final SafetySummary safety;
  final List<String> insights;
  final List<TransactionRecord> recentTransactions;

  factory DashboardSummary.fromJson(Map<String, dynamic> json) {
    final recent = (json['recentTransactions'] as List<dynamic>? ?? [])
        .map((item) => TransactionRecord.fromJson(item as Map<String, dynamic>))
        .toList();

    return DashboardSummary(
      totalIncome: (json['totalIncome'] as num?)?.toDouble() ?? 0,
      totalExpense: (json['totalExpense'] as num?)?.toDouble() ?? 0,
      balance: (json['balance'] as num?)?.toDouble() ?? 0,
      safety: SafetySummary.fromJson(
        json['safety'] as Map<String, dynamic>? ?? <String, dynamic>{},
      ),
      insights: (json['insights'] as List<dynamic>? ?? []).cast<String>(),
      recentTransactions: recent,
    );
  }
}
