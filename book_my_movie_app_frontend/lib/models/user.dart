class User {
  final int id;
  final String name;
  final String email;
  final bool isVerified;
  final bool isActive;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.isVerified,
    required this.isActive,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      isVerified: json['is_verified'] ?? false,
      isActive: json['is_active'] ?? false,
    );
  }
}