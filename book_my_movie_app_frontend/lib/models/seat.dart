class Seat {
  final int id;
  final int hallId;
  final String seatNumber;
  final String seatType;
  final double price;

  Seat({
    required this.id,
    required this.hallId,
    required this.seatNumber,
    required this.seatType,
    required this.price,
  });

  factory Seat.fromJson(Map<String, dynamic> json) {
    double price = 0.0;
    var priceVal = json['price'];
    if (priceVal is String) {
      price = double.tryParse(priceVal) ?? 0.0;
    } else if (priceVal is num) {
      price = priceVal.toDouble();
    }

    return Seat(
      id: json['id'],
      hallId: json['hall_id'],
      seatNumber: json['seat_number'],
      seatType: json['seat_type'] ?? 'REGULAR',
      price: price,
    );
  }
}