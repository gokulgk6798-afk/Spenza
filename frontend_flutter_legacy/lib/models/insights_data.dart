class CategoryInsight {
  const CategoryInsight({
    required this.category,
    required this.amount,
    required this.percentage,
  });

  final String category;
  final double amount;
  final double percentage;

  factory CategoryInsight.fromJson(Map<String, dynamic> json) {
    return CategoryInsight(
      category: json['category'] as String,
      amount: (json['amount'] as num).toDouble(),
      percentage: (json['percentage'] as num).toDouble(),
    );
  }
}

class WeeklyComparison {
  const WeeklyComparison({
    required this.currentWeekExpense,
    required this.previousWeekExpense,
    required this.percentageChange,
  });

  final double currentWeekExpense;
  final double previousWeekExpense;
  final double percentageChange;

  factory WeeklyComparison.fromJson(Map<String, dynamic> json) {
    return WeeklyComparison(
      currentWeekExpense: (json['currentWeekExpense'] as num?)?.toDouble() ?? 0,
      previousWeekExpense: (json['previousWeekExpense'] as num?)?.toDouble() ?? 0,
      percentageChange: (json['percentageChange'] as num?)?.toDouble() ?? 0,
    );
  }
}

class InsightsData {
  const InsightsData({
    required this.categoryBreakdown,
    required this.weeklyComparison,
    required this.alerts,
  });

  final List<CategoryInsight> categoryBreakdown;
  final WeeklyComparison weeklyComparison;
  final List<String> alerts;

  factory InsightsData.fromJson(Map<String, dynamic> json) {
    return InsightsData(
      categoryBreakdown: (json['categoryBreakdown'] as List<dynamic>? ?? [])
          .map((item) => CategoryInsight.fromJson(item as Map<String, dynamic>))
          .toList(),
      weeklyComparison: WeeklyComparison.fromJson(
        json['weeklyComparison'] as Map<String, dynamic>? ??
            <String, dynamic>{},
      ),
      alerts: (json['alerts'] as List<dynamic>? ?? []).cast<String>(),
    );
  }
}
