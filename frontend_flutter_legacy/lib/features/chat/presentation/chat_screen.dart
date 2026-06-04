import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_layout.dart';
import '../../../models/chat_message.dart';
import '../../../services/device_permissions_service.dart';
import '../data/chat_controller.dart';

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _controller = TextEditingController();

  Future<void> _requestPermissions() async {
    await DevicePermissionsService().requestTrackingPermissions();
    if (!mounted) {
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Permissions prompt completed.')),
    );
  }

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty) {
      return;
    }
    _controller.clear();
    await ref.read(chatControllerProvider.notifier).sendMessage(text);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final chatState = ref.watch(chatControllerProvider);

    return LayoutBuilder(
      builder: (context, constraints) {
        final horizontalPadding =
            AppLayout.horizontalPadding(constraints.maxWidth);
        final maxWidth = AppLayout.contentMaxWidth(constraints.maxWidth);
        final bubbleWidth =
            constraints.maxWidth < 420 ? constraints.maxWidth * 0.84 : 420.0;

        return SafeArea(
          bottom: false,
          child: Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(maxWidth: maxWidth),
              child: Column(
                children: [
                  Padding(
                    padding: EdgeInsets.fromLTRB(
                      horizontalPadding,
                      14,
                      horizontalPadding,
                      12,
                    ),
                    child: _ChatHeader(onPermissionTap: _requestPermissions),
                  ),
                  Expanded(
                    child: ListView.builder(
                      padding: EdgeInsets.fromLTRB(
                        horizontalPadding,
                        14,
                        horizontalPadding,
                        12,
                      ),
                      itemCount: chatState.messages.length,
                      itemBuilder: (context, index) {
                        final message = chatState.messages[index];
                        final fromUser = message.role == ChatRole.user;

                        return _MessageBubble(
                          text: message.text,
                          fromUser: fromUser,
                          maxWidth: bubbleWidth,
                        );
                      },
                    ),
                  ),
                  if (chatState.pendingParse != null)
                    Padding(
                      padding: EdgeInsets.fromLTRB(
                        horizontalPadding,
                        0,
                        horizontalPadding,
                        10,
                      ),
                      child: _PendingParseCard(
                        text:
                            '${chatState.pendingParse!.category} | ${chatState.pendingParse!.type} | Rs ${chatState.pendingParse!.amount.toStringAsFixed(0)}',
                        isSaving: chatState.isSaving,
                        onSave: () => ref
                            .read(chatControllerProvider.notifier)
                            .confirmPending(),
                      ),
                    ),
                  Padding(
                    padding: EdgeInsets.fromLTRB(
                      horizontalPadding,
                      0,
                      horizontalPadding,
                      14,
                    ),
                    child: _Composer(
                      controller: _controller,
                      isSending: chatState.isSending,
                      onSend: _send,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _ChatHeader extends StatelessWidget {
  const _ChatHeader({required this.onPermissionTap});

  final VoidCallback onPermissionTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(bottom: 12),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: Row(
        children: [
          IconButton(
            visualDensity: VisualDensity.compact,
            onPressed: () {},
            icon: const Icon(
              Icons.arrow_back_rounded,
              color: AppColors.mutedText,
              size: 20,
            ),
          ),
          const SizedBox(width: 2),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Spenza AI',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        color: AppColors.deepNavy,
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: AppColors.successBright,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      'Actively monitoring',
                      style: Theme.of(context).textTheme.labelMedium?.copyWith(
                            color: AppColors.primaryBlue,
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: onPermissionTap,
            child: const Text('Enable'),
          ),
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: const Color(0xFFEBF0FF),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.memory_rounded,
              color: AppColors.primaryBlue,
              size: 17,
            ),
          ),
        ],
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({
    required this.text,
    required this.fromUser,
    required this.maxWidth,
  });

  final String text;
  final bool fromUser;
  final double maxWidth;

  @override
  Widget build(BuildContext context) {
    if (fromUser) {
      return Align(
        alignment: Alignment.centerRight,
        child: Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 10),
          constraints: BoxConstraints(maxWidth: maxWidth),
          decoration: const BoxDecoration(
            color: AppColors.primaryBlue,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(16),
              topRight: Radius.circular(16),
              bottomLeft: Radius.circular(16),
              bottomRight: Radius.circular(4),
            ),
          ),
          child: Text(
            text,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.white.withValues(alpha: 0.92),
                  height: 1.5,
                ),
          ),
        ),
      );
    }

    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        constraints: BoxConstraints(maxWidth: maxWidth),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.memory_rounded,
                  color: AppColors.primaryBlue,
                  size: 12,
                ),
                const SizedBox(width: 5),
                Text(
                  'SPENZA AI',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: AppColors.mutedText,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.4,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 11),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                  bottomRight: Radius.circular(16),
                  bottomLeft: Radius.circular(4),
                ),
                border: Border.fromBorderSide(
                  BorderSide(color: AppColors.border),
                ),
              ),
              child: Text(
                text,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.secondaryText,
                      height: 1.6,
                    ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PendingParseCard extends StatelessWidget {
  const _PendingParseCard({
    required this.text,
    required this.isSaving,
    required this.onSave,
  });

  final String text;
  final bool isSaving;
  final VoidCallback onSave;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBF0),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFF6D98A)),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.warning_amber_rounded,
            color: Color(0xFFC47A0B),
            size: 18,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'CONFIRM DETECTED TRANSACTION',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: const Color(0xFFC47A0B),
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.4,
                      ),
                ),
                const SizedBox(height: 3),
                Text(
                  text,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: const Color(0xFF9E6A30),
                      ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          ElevatedButton(
            onPressed: isSaving ? null : onSave,
            child: Text(isSaving ? 'Saving' : 'Save'),
          ),
        ],
      ),
    );
  }
}

class _Composer extends StatelessWidget {
  const _Composer({
    required this.controller,
    required this.isSending,
    required this.onSend,
  });

  final TextEditingController controller;
  final bool isSending;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(top: 10),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: controller,
              minLines: 1,
              maxLines: 3,
              onSubmitted: (_) => isSending ? null : onSend(),
              decoration: const InputDecoration(
                hintText: 'Type or say something...',
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 13,
                  vertical: 10,
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Material(
            color: AppColors.primaryBlue,
            borderRadius: BorderRadius.circular(10),
            child: InkWell(
              borderRadius: BorderRadius.circular(10),
              onTap: isSending ? null : onSend,
              child: SizedBox.square(
                dimension: 36,
                child: isSending
                    ? const Padding(
                        padding: EdgeInsets.all(9),
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(
                        Icons.send_rounded,
                        color: Colors.white,
                        size: 17,
                      ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
