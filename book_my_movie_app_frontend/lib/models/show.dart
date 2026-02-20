class Show {
  final int hallId;
  final String showDate;
  final String slot;

  Show({
    required this.hallId,
    required this.showDate,
    required this.slot,
  });

  factory Show.fromJson(Map<String, dynamic> json) {
    return Show(
      hallId: json['hall_id'],
      showDate: json['show_date'],
      slot: json['slot'],
    );
  }
}