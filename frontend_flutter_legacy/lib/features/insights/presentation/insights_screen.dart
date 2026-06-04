import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_layout.dart';
import '../../../models/insights_data.dart';
import '../data/insights_repository.dart';

class InsightsScreen extends ConsumerWidget {
  const InsightsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final insights = ref.watch(insightsProvider);
    final currency = NumberFormat.currency(symbol: 'Rs ', decimalDigits: 0);

    return insights.when(
      data: (data) => LayoutBuilder(
        builder: (context, constraints) {
          final horizontalPadding =
              AppLayout.horizontalPadding(constraints.maxWidth);
          final maxWidth = math.min(
            AppLayout.contentMaxWidth(constraints.maxWidth),
            430.0,
          );
          final total = data.categoryBreakdown.fold<double>(
            0,
            (sum, item) => sum + item.amount,
          );
          final categories = data.categoryBreakdown.isEmpty
              ? const [
                  CategoryInsight(
                    category: 'Groceries',
                    amount: 11200,
                    percentage: 25,
                  ),
                  CategoryInsight(
                    category: 'Dining',
                    amount: 8840,
                    percentage: 18,
                  ),
                  CategoryInsight(
                    category: 'Transport',
                    amount: 5380,
                    percentage: 12,
                  ),
                ]
              : data.categoryBreakdown;

          return SafeArea(
            bottom: false,
            child: Center(
              child: ConstrainedBox(
                constraints: BoxConstraints(maxWidth: maxWidth),
                child: ListView(
                  padding: EdgeInsets.fromLTRB(
                    horizontalPadding,
                    14,
                    horizontalPadding,
                    24,
                  ),
                  children: [
                    const _TopRow(),
                    const SizedBox(height: 16),
                    _DonutSummary(
                      total: total == 0 ? 44820 : total,
                      categories: categories,
                      currency: currency,
                    ),
                    const SizedBox(height: 16),
                    const _SectionHeader(
                      title: 'Category breakdown',
                      action: 'All categories',
                    ),
                    const SizedBox(height: 10),
                    ...categories.take(5).map(
                          (item) => Padding(
                            padding: const EdgeInsets.only(bottom: 7),
                            child: _CategoryCard(
                              item: item,
                              color: _categoryColor(item.category),
                              currency: currency,
                            ),
                          ),
                        ),
                    const SizedBox(height: 8),
                    Text(
                      'vs. financial norms',
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            color: AppColors.deepNavy,
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                    const SizedBox(height: 10),
                    const _NormRow(
                      name: 'Needs',
                      description: 'Housing, food, utilities - max 50%',
                      chip: '44%',
                      statusColor: AppColors.success,
                      progress: 0.88,
                      footer: 'You: 44% of 50%',
                    ),
                    const SizedBox(height: 7),
                    const _NormRow(
                      name: 'Wants',
                      description: 'Dining, leisure, subs - max 30%',
                      chip: '34%',
                      statusColor: AppColors.danger,
                      progress: 1,
                      footer: 'Over by 4%',
                    ),
                    const SizedBox(height: 7),
                    const _NormRow(
                      name: 'Savings',
                      description: 'Investments, emergency - min 20%',
                      chip: '22%',
                      statusColor: AppColors.warning,
                      progress: 1,
                      footer: 'Just above target',
                    ),
                    if (data.alerts.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      const _SectionHeader(
                        title: 'Alerts',
                        action: 'Review',
                      ),
                      const SizedBox(height: 10),
                      ...data.alerts.map(
                        (alert) => Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: _AlertTile(text: alert),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          );
        },
      ),
      error: (_, __) => const Center(child: Text('Unable to load insights')),
      loading: () => const Center(child: CircularProgressIndicator()),
    );
  }

  static Color _categoryColor(String category) {
    final key = category.toLowerCase();
    if (key.contains('dining') || key.contains('food')) {
      return AppColors.danger;
    }
    if (key.contains('transport') || key.contains('auto')) {
      return AppColors.warning;
    }
    if (key.contains('util') || key.contains('bill')) {
      return AppColors.success;
    }
    if (key.contains('shop')) {
      return AppColors.purple;
    }
    return AppColors.primaryBlue;
  }
}

class _TopRow extends StatelessWidget {
  const _TopRow();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Icon(
          Icons.arrow_back_rounded,
          color: AppColors.mutedText,
          size: 20,
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            'Spending analytics',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0,
                ),
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(9),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              const Icon(
                Icons.calendar_month_outlined,
                size: 13,
                color: AppColors.mutedText,
              ),
              const SizedBox(width: 5),
              Text(
                'May 2026',
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      color: AppColors.secondaryText,
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const SizedBox(width: 3),
              const Icon(
                Icons.keyboard_arrow_down_rounded,
                size: 14,
                color: AppColors.mutedText,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _DonutSummary extends StatelessWidget {
  const _DonutSummary({
    required this.total,
    required this.categories,
    required this.currency,
  });

  final double total;
  final List<CategoryInsight> categories;
  final NumberFormat currency;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          SizedBox.square(
            dimension: 96,
            child: CustomPaint(
              painter: _DonutPainter(categories),
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'TOTAL',
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: AppColors.mutedText,
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                    Text(
                      NumberFormat.compactCurrency(
                        symbol: 'Rs ',
                        decimalDigits: 1,
                      ).format(total),
                      style: Theme.of(context).textTheme.labelLarge?.copyWith(
                            color: AppColors.deepNavy,
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              children: categories.take(5).map((item) {
                final color = InsightsScreen._categoryColor(item.category);
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: color,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                      const SizedBox(width: 7),
                      Expanded(
                        child: Text(
                          item.category,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style:
                              Theme.of(context).textTheme.labelMedium?.copyWith(
                                    color: AppColors.mutedText,
                                    fontWeight: FontWeight.w600,
                                  ),
                        ),
                      ),
                      Text(
                        '${item.percentage.toStringAsFixed(0)}%',
                        style:
                            Theme.of(context).textTheme.labelMedium?.copyWith(
                                  color: AppColors.deepNavy,
                                  fontWeight: FontWeight.w900,
                                ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}

class _DonutPainter extends CustomPainter {
  const _DonutPainter(this.categories);

  final List<CategoryInsight> categories;

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final stroke = size.width * 0.13;
    final basePaint = Paint()
      ..color = const Color(0xFFF0F2F7)
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.butt;

    canvas.drawCircle(size.center(Offset.zero), size.width * 0.38, basePaint);

    var start = -math.pi / 2;
    for (final item in categories.take(5)) {
      final sweep = (item.percentage.clamp(2, 100) / 100) * math.pi * 2;
      final paint = Paint()
        ..color = InsightsScreen._categoryColor(item.category)
        ..style = PaintingStyle.stroke
        ..strokeWidth = stroke
        ..strokeCap = StrokeCap.butt;
      canvas.drawArc(
        rect.deflate(stroke * 1.2),
        start,
        sweep,
        false,
        paint,
      );
      start += sweep;
    }
  }

  @override
  bool shouldRepaint(covariant _DonutPainter oldDelegate) =>
      oldDelegate.categories != categories;
}

class _CategoryCard extends StatelessWidget {
  const _CategoryCard({
    required this.item,
    required this.color,
    required this.currency,
  });

  final CategoryInsight item;
  final Color color;
  final NumberFormat currency;

  @override
  Widget build(BuildContext context) {
    final budget = item.amount / (item.percentage.clamp(1, 100) / 100);
    final progress = (item.percentage / 100).clamp(0.05, 1.0);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(7),
                ),
                child:
                    Icon(_categoryIcon(item.category), color: color, size: 14),
              ),
              const SizedBox(width: 7),
              Expanded(
                child: Text(
                  item.category,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.deepNavy,
                        fontWeight: FontWeight.w800,
                      ),
                ),
              ),
              Text(
                currency.format(item.amount),
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.deepNavy,
                      fontWeight: FontWeight.w900,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(3),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 5,
              color: color,
              backgroundColor: const Color(0xFFF0F2F7),
            ),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Text(
                'Budget ${currency.format(budget)}',
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: const Color(0xFFB2B8C6),
                      fontWeight: FontWeight.w600,
                    ),
              ),
              const Spacer(),
              Text(
                item.percentage >= 90
                    ? 'Near limit'
                    : item.percentage >= 70
                        ? 'Watch'
                        : 'On track',
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: item.percentage >= 90
                          ? AppColors.danger
                          : AppColors.success,
                      fontWeight: FontWeight.w900,
                    ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  static IconData _categoryIcon(String category) {
    final key = category.toLowerCase();
    if (key.contains('dining') || key.contains('food')) {
      return Icons.restaurant_rounded;
    }
    if (key.contains('transport')) {
      return Icons.directions_car_rounded;
    }
    if (key.contains('util') || key.contains('bill')) {
      return Icons.receipt_long_rounded;
    }
    if (key.contains('shop')) {
      return Icons.shopping_bag_rounded;
    }
    return Icons.shopping_cart_rounded;
  }
}

class _NormRow extends StatelessWidget {
  const _NormRow({
    required this.name,
    required this.description,
    required this.chip,
    required this.statusColor,
    required this.progress,
    required this.footer,
  });

  final String name;
  final String description;
  final String chip;
  final Color statusColor;
  final double progress;
  final String footer;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.deepNavy,
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                    Text(
                      description,
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: AppColors.mutedText,
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  chip,
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: statusColor,
                        fontWeight: FontWeight.w900,
                      ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(3),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 5,
              color: statusColor,
              backgroundColor: const Color(0xFFF0F2F7),
            ),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Text(
                '0%',
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: const Color(0xFFC2C8D8),
                      fontWeight: FontWeight.w600,
                    ),
              ),
              const Spacer(),
              Text(
                footer,
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: statusColor,
                      fontWeight: FontWeight.w900,
                    ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, required this.action});

  final String title;
  final String action;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                color: AppColors.deepNavy,
                fontWeight: FontWeight.w800,
              ),
        ),
        const Spacer(),
        Text(
          action,
          style: Theme.of(context).textTheme.labelMedium?.copyWith(
                color: AppColors.primaryBlue,
                fontWeight: FontWeight.w800,
              ),
        ),
      ],
    );
  }
}

class _AlertTile extends StatelessWidget {
  const _AlertTile({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBF0),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFF6D98A)),
      ),
      child: Text(
        text,
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: const Color(0xFF9E6A30),
              height: 1.45,
            ),
      ),
    );
  }
}
