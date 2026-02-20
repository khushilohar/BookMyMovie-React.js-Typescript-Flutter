class Hall {
  final int id;
  final String hallName;
  final int totalSeats;
  final String? location;

  Hall({
    required this.id,
    required this.hallName,
    required this.totalSeats,
    this.location,
  });

  factory Hall.fromJson(Map<String, dynamic> json) {
    return Hall(
      id: json['id'],
      hallName: json['hall_name'],
      totalSeats: json['total_seats'],
      location: json['location'],
    );
  }
}