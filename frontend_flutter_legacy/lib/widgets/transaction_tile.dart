import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../core/constants/app_colors.dart';
import '../models/transaction_record.dart';

class TransactionTile extends StatelessWidget {
  const TransactionTile({
    super.key,
    required this.transaction,
  });

  final TransactionRecord transaction;

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(symbol: 'Rs ', decimalDigits: 0);

    return LayoutBuilder(
      builder: (context, constraints) {
        final isCompact = constraints.maxWidth < 360;

        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                backgroundColor: transaction.type == 'expense'
                    ? AppColors.warning.withValues(alpha: 0.15)
                    : AppColors.success.withValues(alpha: 0.15),
                child: Icon(
                  transaction.type == 'expense'
                      ? Icons.arrow_upward_rounded
                      : Icons.arrow_downward_rounded,
                  color: transaction.type == 'expense'
                      ? AppColors.warning
                      : AppColors.success,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (isCompact) ...[
                      Text(
                        currency.format(transaction.amount),
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              fontWeight: FontWeight.w700,
                              color: AppColors.deepNavy,
                            ),
                      ),
                      const SizedBox(height: 8),
                    ],
                    Text(
                      transaction.vendor.isEmpty
                          ? transaction.category.toUpperCase()
                          : transaction.vendor,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${transaction.category} | ${DateFormat.MMMd().add_jm().format(transaction.timestamp)}',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppColors.ink.withValues(alpha: 0.65),
                          ),
                    ),
                  ],
                ),
              ),
              if (!isCompact)
                Text(
                  currency.format(transaction.amount),
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.deepNavy,
                      ),
                ),
            ],
          ),
        );
      },
    );
  }
}
