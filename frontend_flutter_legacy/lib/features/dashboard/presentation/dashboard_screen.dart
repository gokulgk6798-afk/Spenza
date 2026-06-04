import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_layout.dart';
import '../../auth/data/session_controller.dart';
import '../data/dashboard_repository.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(dashboardProvider);

    return dashboard.when(
      data: (data) => LayoutBuilder(
        builder: (context, constraints) {
          final horizontalPadding =
              AppLayout.horizontalPadding(constraints.maxWidth);
          final maxWidth = math.min(
            AppLayout.contentMaxWidth(constraints.maxWidth),
            430.0,
          );
          final currency = NumberFormat.currency(
            symbol: 'Rs ',
            decimalDigits: 0,
          );
          final ratio = data.totalIncome <= 0
              ? 0.0
              : (data.totalExpense / data.totalIncome).clamp(0.0, 1.4);
          final score = (86 - (ratio * 32)).clamp(45, 92).round();
          final insights = data.insights.isEmpty
              ? const [
                  'Your EMI-to-income ratio is within the safe zone.',
                  'Dining and shopping are the fastest moving categories.',
                  'Keep this pace and your monthly savings stay positive.',
                ]
              : data.insights;

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
                    _TopBar(
                      onLogout: () =>
                          ref.read(sessionProvider.notifier).logout(),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'Good morning,',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.mutedText,
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Priya Krishnan',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontSize: 21,
                            letterSpacing: 0,
                          ),
                    ),
                    const SizedBox(height: 18),
                    _HealthScoreCard(
                        score: score, message: data.safety.message),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          child: _KpiCard(
                            icon: Icons.arrow_downward_rounded,
                            iconColor: AppColors.primaryBlue,
                            iconBackground: const Color(0xFFEBF0FF),
                            label: 'Monthly income',
                            value: currency.format(data.totalIncome),
                            note: 'Salary + freelance',
                            noteColor: AppColors.success,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _KpiCard(
                            icon: Icons.arrow_upward_rounded,
                            iconColor: AppColors.danger,
                            iconBackground: const Color(0xFFFEF2F2),
                            label: 'Spent this month',
                            value: currency.format(data.totalExpense),
                            note: '${(ratio * 100).round()}% of income',
                            noteColor: AppColors.danger,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    _AlertBar(
                      text:
                          '${currency.format(data.totalExpense)} spent this month. ${data.safety.status == 'healthy' ? 'You are tracking safely.' : 'Review high-spend categories today.'}',
                    ),
                    const SizedBox(height: 16),
                    const _SectionHeader(
                      title: 'Smart insights',
                      action: 'View all',
                    ),
                    const SizedBox(height: 10),
                    for (var i = 0; i < math.min(insights.length, 3); i++) ...[
                      _InsightItem(
                        color: _insightColor(i),
                        text: insights[i],
                      ),
                      if (i != math.min(insights.length, 3) - 1)
                        const SizedBox(height: 6),
                    ],
                    const SizedBox(height: 16),
                    const _SectionHeader(
                      title: 'Recent activity',
                      action: 'All',
                    ),
                    const SizedBox(height: 10),
                    ...data.recentTransactions.take(3).map(
                          (transaction) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: _RecentTransaction(
                              title: transaction.vendor.isEmpty
                                  ? transaction.category
                                  : transaction.vendor,
                              category: transaction.category,
                              amount: currency.format(transaction.amount),
                              isIncome: transaction.type == 'income',
                            ),
                          ),
                        ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
      error: (_, __) => const Center(child: Text('Unable to load dashboard')),
      loading: () => const Center(child: CircularProgressIndicator()),
    );
  }

  static Color _insightColor(int index) {
    return switch (index) {
      0 => AppColors.primaryBlue,
      1 => AppColors.warning,
      _ => AppColors.success,
    };
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({required this.onLogout});

  final VoidCallback onLogout;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const _BrandMark(),
        const SizedBox(width: 9),
        RichText(
          text: TextSpan(
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontSize: 18,
                  letterSpacing: 0,
                ),
            children: const [
              TextSpan(text: 'spen'),
              TextSpan(
                text: 'za',
                style: TextStyle(color: AppColors.primaryBlue),
              ),
            ],
          ),
        ),
        const Spacer(),
        _IconButton(icon: Icons.search_rounded, onTap: () {}),
        const SizedBox(width: 8),
        _IconButton(
          icon: Icons.logout_rounded,
          onTap: onLogout,
          showDot: true,
        ),
      ],
    );
  }
}

class _BrandMark extends StatelessWidget {
  const _BrandMark();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 33,
      height: 33,
      decoration: BoxDecoration(
        color: AppColors.primaryBlue,
        borderRadius: BorderRadius.circular(10),
      ),
      child: const Icon(
        Icons.arrow_forward_rounded,
        color: Colors.white,
        size: 19,
      ),
    );
  }
}

class _IconButton extends StatelessWidget {
  const _IconButton({
    required this.icon,
    required this.onTap,
    this.showDot = false,
  });

  final IconData icon;
  final VoidCallback onTap;
  final bool showDot;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: onTap,
        child: Stack(
          children: [
            Container(
              width: 35,
              height: 35,
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.border),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: AppColors.secondaryText, size: 18),
            ),
            if (showDot)
              Positioned(
                top: 5,
                right: 5,
                child: Container(
                  width: 7,
                  height: 7,
                  decoration: BoxDecoration(
                    color: AppColors.danger,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.surface),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _HealthScoreCard extends StatelessWidget {
  const _HealthScoreCard({required this.score, required this.message});

  final int score;
  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.primaryBlue,
        borderRadius: BorderRadius.circular(22),
      ),
      child: Stack(
        children: [
          const Positioned(
            top: -44,
            right: -38,
            child: _Ring(size: 122, width: 26),
          ),
          const Positioned(
            bottom: -52,
            left: 8,
            child: _Ring(size: 110, width: 22, opacity: 0.04),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'FINANCIAL HEALTH SCORE',
                          style:
                              Theme.of(context).textTheme.labelSmall?.copyWith(
                                    color: Colors.white.withValues(alpha: 0.64),
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 0.8,
                                  ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '$score',
                          style: Theme.of(context)
                              .textTheme
                              .displayMedium
                              ?.copyWith(
                                color: Colors.white,
                                fontSize: 40,
                                height: 1,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0,
                              ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          message.isEmpty
                              ? 'Good - improving steadily'
                              : message,
                          style:
                              Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: Colors.white.withValues(alpha: 0.68),
                                    fontWeight: FontWeight.w600,
                                  ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 11,
                      vertical: 7,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(9),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.22),
                      ),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.trending_up_rounded,
                          color: Colors.white,
                          size: 13,
                        ),
                        const SizedBox(width: 5),
                        Text(
                          '+6 pts',
                          style:
                              Theme.of(context).textTheme.labelMedium?.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w800,
                                  ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              const Wrap(
                spacing: 6,
                runSpacing: 6,
                children: [
                  _HealthPill(
                      color: Color(0xFF4ADE80), label: 'Savings on track'),
                  _HealthPill(
                      color: Color(0xFFFCD34D), label: 'Food spend high'),
                  _HealthPill(color: Color(0xFF4ADE80), label: 'EMI safe zone'),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Ring extends StatelessWidget {
  const _Ring({
    required this.size,
    required this.width,
    this.opacity = 0.07,
  });

  final double size;
  final double width;
  final double opacity;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(
          color: Colors.white.withValues(alpha: opacity),
          width: width,
        ),
      ),
    );
  }
}

class _HealthPill extends StatelessWidget {
  const _HealthPill({required this.color, required this.label});

  final Color color;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.13),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 5),
          Text(
            label,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: Colors.white.withValues(alpha: 0.88),
                  fontWeight: FontWeight.w700,
                ),
          ),
        ],
      ),
    );
  }
}

class _KpiCard extends StatelessWidget {
  const _KpiCard({
    required this.icon,
    required this.iconColor,
    required this.iconBackground,
    required this.label,
    required this.value,
    required this.note,
    required this.noteColor,
  });

  final IconData icon;
  final Color iconColor;
  final Color iconBackground;
  final String label;
  final String value;
  final String note;
  final Color noteColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(
              color: iconBackground,
              borderRadius: BorderRadius.circular(9),
            ),
            child: Icon(icon, size: 16, color: iconColor),
          ),
          const SizedBox(height: 10),
          Text(
            label.toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: AppColors.mutedText,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.4,
                ),
          ),
          const SizedBox(height: 3),
          FittedBox(
            alignment: Alignment.centerLeft,
            fit: BoxFit.scaleDown,
            child: Text(
              value,
              maxLines: 1,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: AppColors.deepNavy,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0,
                  ),
            ),
          ),
          const SizedBox(height: 3),
          Text(
            note,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: noteColor,
                  fontWeight: FontWeight.w800,
                ),
          ),
        ],
      ),
    );
  }
}

class _AlertBar extends StatelessWidget {
  const _AlertBar({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBF0),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFF6D98A)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(
              color: const Color(0xFFFEF3D0),
              borderRadius: BorderRadius.circular(9),
            ),
            child: const Icon(
              Icons.warning_amber_rounded,
              size: 16,
              color: Color(0xFFC47A0B),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Dining spend alert',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: const Color(0xFF7A4A06),
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 2),
                Text(
                  text,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: const Color(0xFF9E6A30),
                        height: 1.45,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Ask Spenza AI how to fix this',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: const Color(0xFFC47A0B),
                        fontWeight: FontWeight.w800,
                      ),
                ),
              ],
            ),
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

class _InsightItem extends StatelessWidget {
  const _InsightItem({required this.color, required this.text});

  final Color color;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 11),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 3,
            height: 30,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.secondaryText,
                    height: 1.45,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}

class _RecentTransaction extends StatelessWidget {
  const _RecentTransaction({
    required this.title,
    required this.category,
    required this.amount,
    required this.isIncome,
  });

  final String title;
  final String category;
  final String amount;
  final bool isIncome;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color:
                  isIncome ? const Color(0xFFECFDF5) : const Color(0xFFEBF0FF),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              isIncome
                  ? Icons.arrow_downward_rounded
                  : Icons.shopping_bag_outlined,
              color: isIncome ? AppColors.success : AppColors.primaryBlue,
              size: 17,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                Text(
                  category,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        color: AppColors.mutedText,
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ],
            ),
          ),
          Text(
            amount,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: isIncome ? AppColors.success : AppColors.deepNavy,
                  fontWeight: FontWeight.w800,
                ),
          ),
        ],
      ),
    );
  }
}
