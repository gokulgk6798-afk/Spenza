import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../models/parse_result.dart';
import '../../../models/transaction_record.dart';
import 'transactions_repository.dart';

final transactionsControllerProvider = StateNotifierProvider<
    TransactionsController, AsyncValue<List<TransactionRecord>>>((ref) {
  return TransactionsController(ref);
});

class TransactionsController
    extends StateNotifier<AsyncValue<List<TransactionRecord>>> {
  TransactionsController(this._ref) : super(const AsyncValue.loading()) {
    load();
  }

  final Ref _ref;
  String _category = 'all';

  Future<void> load({String category = 'all'}) async {
    _category = category;
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(
      () => _ref
          .read(transactionsRepositoryProvider)
          .fetchTransactions(category: category),
    );
  }

  Future<void> refresh() => load(category: _category);

  Future<TransactionRecord> createFromParse(ParseResult parsed) async {
    final transaction =
        await _ref.read(transactionsRepositoryProvider).createTransaction(
              amount: parsed.amount,
              type: parsed.type,
              category: parsed.category,
              vendor: parsed.vendor,
              rawText: parsed.originalText,
              source: 'chat',
            );
    await refresh();
    return transaction;
  }
}

