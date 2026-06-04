enum ChatRole { user, assistant }

class ChatMessage {
  const ChatMessage({
    required this.id,
    required this.role,
    required this.text,
  });

  final String id;
  final ChatRole role;
  final String text;
}

