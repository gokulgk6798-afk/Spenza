class TransactionRecord {
  const TransactionRecord({
    required this.id,
    required this.amount,
    required this.type,
    required this.category,
    required this.vendor,
    required this.timestamp,
    required this.source,
    required this.mergeCount,
  });

  final String id;
  final double amount;
  final String type;
  final String category;
  final String vendor;
  final DateTime timestamp;
  final String source;
  final int mergeCount;

  factory TransactionRecord.fromJson(Map<String, dynamic> json) {
    return TransactionRecord(
      id: (json['_id'] ?? json['id']) as String,
      amount: (json['amount'] as num).toDouble(),
      type: json['type'] as String,
      category: json['category'] as String? ?? 'other',
      vendor: json['vendor'] as String? ?? '',
      timestamp: DateTime.parse(json['timestamp'] as String),
      source: json['source'] as String? ?? 'chat',
      mergeCount: (json['mergeCount'] as num?)?.toInt() ?? 1,
    );
  }
}

