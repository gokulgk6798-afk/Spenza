class ParseResult {
  const ParseResult({
    required this.amount,
    required this.type,
    required this.category,
    required this.vendor,
    required this.confidence,
    required this.originalText,
  });

  final double amount;
  final String type;
  final String category;
  final String vendor;
  final double confidence;
  final String originalText;

  factory ParseResult.fromJson(Map<String, dynamic> json) {
    return ParseResult(
      amount: (json['amount'] as num).toDouble(),
      type: json['type'] as String,
      category: json['category'] as String? ?? 'other',
      vendor: json['vendor'] as String? ?? '',
      confidence: (json['confidence'] as num?)?.toDouble() ?? 0,
      originalText: json['originalText'] as String? ?? '',
    );
  }
}

