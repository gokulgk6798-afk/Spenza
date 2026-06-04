import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_layout.dart';
import '../../../widgets/transaction_tile.dart';
import '../data/transactions_controller.dart';

class TransactionsScreen extends ConsumerStatefulWidget {
  const TransactionsScreen({super.key});

  @override
  ConsumerState<TransactionsScreen> createState() =>
      _TransactionsScreenState();
}

class _TransactionsScreenState extends ConsumerState<TransactionsScreen> {
  String _selectedCategory = 'all';
  final categories = const ['all', 'food', 'transport', 'bills', 'shopping'];

  @override
  Widget build(BuildContext context) {
    final transactions = ref.watch(transactionsControllerProvider);

    return LayoutBuilder(
      builder: (context, constraints) {
        final horizontalPadding =
            AppLayout.horizontalPadding(constraints.maxWidth);
        final maxWidth = AppLayout.contentMaxWidth(constraints.maxWidth);

        return Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: maxWidth),
            child: Column(
              children: [
                const SizedBox(height: 12),
                SizedBox(
                  height: 42,
                  child: ListView.separated(
                    padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                    scrollDirection: Axis.horizontal,
                    itemCount: categories.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 10),
                    itemBuilder: (context, index) {
                      final category = categories[index];
                      final selected = _selectedCategory == category;

                      return ChoiceChip(
                        label: Text(category.toUpperCase()),
                        selected: selected,
                        selectedColor: AppColors.deepNavy,
                        labelStyle: TextStyle(
                          color: selected ? Colors.white : AppColors.deepNavy,
                          fontWeight: FontWeight.w600,
                        ),
                        onSelected: (_) {
                          setState(() {
                            _selectedCategory = category;
                          });
                          ref
                              .read(transactionsControllerProvider.notifier)
                              .load(category: category);
                        },
                      );
                    },
                  ),
                ),
                const SizedBox(height: 12),
                Expanded(
                  child: transactions.when(
                    data: (items) => RefreshIndicator(
                      onRefresh: () =>
                          ref.read(transactionsControllerProvider.notifier).refresh(),
                      child: ListView.separated(
                        padding: EdgeInsets.all(horizontalPadding),
                        itemBuilder: (context, index) =>
                            TransactionTile(transaction: items[index]),
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemCount: items.length,
                      ),
                    ),
                    error: (_, __) =>
                        const Center(child: Text('Unable to load transactions')),
                    loading: () =>
                        const Center(child: CircularProgressIndicator()),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
