class Booking {
  final int id;
  final int userId;
  final int movieId;
  final int hallId;
  final String slotSelected;
  final String bookingDate;
  final String seatsSelected;
  final int totalSeats;
  final double totalAmount;
  final String paymentStatus;
  final String bookingStatus;
  final String createdAt;
  String? movieTitle;
  String? movieImage;

  Booking({
    required this.id,
    required this.userId,
    required this.movieId,
    required this.hallId,
    required this.slotSelected,
    required this.bookingDate,
    required this.seatsSelected,
    required this.totalSeats,
    required this.totalAmount,
    required this.paymentStatus,
    required this.bookingStatus,
    required this.createdAt,
    this.movieTitle,
    this.movieImage,
  });

  double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is String) return double.tryParse(value) ?? 0.0;
    if (value is num) return value.toDouble();
    return 0.0;
  }

  factory Booking.fromJson(Map<String, dynamic> json) {
    // Helper to safely parse int from any type
    int _parseInt(dynamic value, {int defaultValue = 0}) {
      if (value == null) return defaultValue;
      if (value is int) return value;
      if (value is String) return int.tryParse(value) ?? defaultValue;
      if (value is num) return value.toInt();
      return defaultValue;
    }

    // Helper to safely parse double from any type
    double _parseDouble(dynamic value, {double defaultValue = 0.0}) {
      if (value == null) return defaultValue;
      if (value is double) return value;
      if (value is int) return value.toDouble();
      if (value is String) return double.tryParse(value) ?? defaultValue;
      if (value is num) return value.toDouble();
      return defaultValue;
    }

    return Booking(
      id: json['id'],
      userId: json['user_id'],
      movieId: json['movie_id'],
      hallId: json['hall_id'],
      slotSelected: json['slot_selected'],
      bookingDate: json['booking_date'],
      seatsSelected: json['seats_selected'],
      totalSeats: json['total_seats'] ?? 1,
      totalAmount: _parseDouble(json['total_amount']),
      paymentStatus: json['payment_status'] ?? 'PENDING',
      bookingStatus: json['booking_status'] ?? 'CONFIRMED',
      createdAt: json['created_at'],
      movieTitle: json['movie_title'],
      movieImage: json['movie_image'],
    );
  }
}