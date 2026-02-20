import 'api_service.dart';
import '../models/seat.dart';

class SeatApi {
  // Get all seats for a hall
  static Future<List<Seat>> getSeatsByHall(int hallId) async {
    final response = await ApiService.get('/seats/hall/$hallId');
    // backend returns { seats: [...] } or array directly
    final List data = response['seats'] ?? response['data'] ?? response;
    return data.map((json) => Seat.fromJson(json)).toList();
  }

  // Get booked seat numbers for a specific show
  static Future<List<String>> getBookedSeatNumbers({
    required int movieId,
    required int hallId,
    required String bookingDate,
    required String slotSelected,
  }) async {
    final response = await ApiService.get(
      '/booking/check-seats?movie_id=$movieId&hall_id=$hallId&booking_date=$bookingDate&slot_selected=$slotSelected',
    );
    final List booked = response['booked_seats'] ?? response['data'] ?? [];
    return booked.map((e) => e.toString()).toList();
  }
}