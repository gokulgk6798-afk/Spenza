class AppUser {
  const AppUser({
    required this.id,
    required this.email,
    required this.displayName,
    required this.token,
  });

  final String id;
  final String email;
  final String displayName;
  final String token;

  factory AppUser.fromJson(Map<String, dynamic> json, String token) {
    return AppUser(
      id: json['id'] as String,
      email: json['email'] as String,
      displayName: (json['displayName'] as String?) ?? '',
      token: token,
    );
  }
}

