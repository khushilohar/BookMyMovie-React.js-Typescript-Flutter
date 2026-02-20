class Movie {
  final int id;
  final String title;
  final String description;
  final String image;
  final double rating;
  final int durationMinutes;
  final String? releaseDate;

  Movie({
    required this.id,
    required this.title,
    required this.description,
    required this.image,
    required this.rating,
    required this.durationMinutes,
    this.releaseDate,
  });

  factory Movie.fromJson(Map<String, dynamic> json) {
    // Helper to parse rating (could be num or String)
    double parseRating(dynamic value) {
      if (value == null) return 0.0;
      if (value is num) return value.toDouble();
      if (value is String) return double.tryParse(value) ?? 0.0;
      return 0.0;
    }

    // Helper to parse duration (could be int or String)
    int parseDuration(dynamic value) {
      if (value == null) return 0;
      if (value is int) return value;
      if (value is String) return int.tryParse(value) ?? 0;
      return 0;
    }

    double _parseDouble(dynamic value) {
      if (value == null) return 0.0;
      if (value is String) return double.tryParse(value) ?? 0.0;
      if (value is num) return value.toDouble();
      return 0.0;
    }

    return Movie(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      image: json['image'] ?? '',
      rating: _parseDouble(json['rating']),
      durationMinutes: json['duration_minutes'] ?? 0,
      releaseDate: json['release_date'],
    );
  }
}