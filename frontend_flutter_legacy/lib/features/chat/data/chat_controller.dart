import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../models/chat_message.dart';
import '../../../models/parse_result.dart';
import '../../dashboard/data/dashboard_repository.dart';
import '../../insights/data/insights_repository.dart';
import '../../transactions/data/transactions_controller.dart';
import '../../transactions/data/transactions_repository.dart';

class ChatState {
  const ChatState({
    this.messages = const [],
    this.pendingParse,
    this.isSending = false,
    this.isSaving = false,
  });

  final List<ChatMessage> messages;
  final ParseResult? pendingParse;
  final bool isSending;
  final bool isSaving;

  ChatState copyWith({
    List<ChatMessage>? messages,
    ParseResult? pendingParse,
    bool clearPending = false,
    bool? isSending,
    bool? isSaving,
  }) {
    return ChatState(
      messages: messages ?? this.messages,
      pendingParse: clearPending ? null : (pendingParse ?? this.pendingParse),
      isSending: isSending ?? this.isSending,
      isSaving: isSaving ?? this.isSaving,
    );
  }
}

final chatControllerProvider =
    StateNotifierProvider<ChatController, ChatState>((ref) {
  return ChatController(ref);
});

class ChatController extends StateNotifier<ChatState> {
  ChatController(this._ref)
      : super(
          const ChatState(
            messages: [
              ChatMessage(
                id: 'welcome',
                role: ChatRole.assistant,
                text:
                    'Tell me something like "Spent 240 on food at Swiggy" and I will turn it into a transaction.',
              ),
            ],
          ),
        );

  final Ref _ref;

  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty) {
      return;
    }

    final nextMessages = [
      ...state.messages,
      ChatMessage(
        id: DateTime.now().microsecondsSinceEpoch.toString(),
        role: ChatRole.user,
        text: text.trim(),
      ),
    ];

    state = state.copyWith(messages: nextMessages, isSending: true);

    try {
      final parsed = await _ref
          .read(transactionsRepositoryProvider)
          .parseTransactionText(text.trim());

      state = state.copyWith(
        messages: [
          ...nextMessages,
          ChatMessage(
            id: '${DateTime.now().microsecondsSinceEpoch}-system',
            role: ChatRole.assistant,
            text:
                'I parsed ${parsed.type} of ${parsed.amount.toStringAsFixed(0)} in ${parsed.category}. Confirm to save it.',
          ),
        ],
        pendingParse: parsed,
        isSending: false,
      );
    } catch (_) {
      state = state.copyWith(
        messages: [
          ...nextMessages,
          ChatMessage(
            id: '${DateTime.now().microsecondsSinceEpoch}-error',
            role: ChatRole.assistant,
            text:
                'I could not confidently parse that. Try a message like "Spent 200 food at Starbucks".',
          ),
        ],
        clearPending: true,
        isSending: false,
      );
    }
  }

  Future<void> confirmPending() async {
    final parsed = state.pendingParse;
    if (parsed == null) {
      return;
    }

    state = state.copyWith(isSaving: true);

    try {
      final transaction = await _ref
          .read(transactionsControllerProvider.notifier)
          .createFromParse(parsed);

      _ref.invalidate(dashboardProvider);
      _ref.invalidate(insightsProvider);

      state = state.copyWith(
        messages: [
          ...state.messages,
          ChatMessage(
            id: '${DateTime.now().microsecondsSinceEpoch}-saved',
            role: ChatRole.assistant,
            text:
                'Saved ${transaction.category} for ${transaction.amount.toStringAsFixed(0)}. Your dashboard is updated.',
          ),
        ],
        clearPending: true,
        isSaving: false,
      );
    } catch (_) {
      state = state.copyWith(
        messages: [
          ...state.messages,
          ChatMessage(
            id: '${DateTime.now().microsecondsSinceEpoch}-save-error',
            role: ChatRole.assistant,
            text: 'Saving failed. Please check the API connection and try again.',
          ),
        ],
        isSaving: false,
      );
    }
  }
}

