import 'api_service.dart';
import '../models/booking.dart';

class BookingApi {
  static Future<Map<String, dynamic>> createBooking({
    required int userId,
    required int movieId,
    required int hallId,
    required String slotSelected,
    required String bookingDate,
    required String seatsSelected,
    required int totalSeats,
    required double totalAmount,
  }) async {
    final response = await ApiService.post('/booking', body: {
      'user_id': userId,
      'movie_id': movieId,
      'hall_id': hallId,
      'slot_selected': slotSelected,
      'booking_date': bookingDate,
      'seats_selected': seatsSelected,
      'total_seats': totalSeats,
      'total_amount': totalAmount,
    });
    return response;
  }

  static Future<List<Booking>> getBookingsByUser(int userId) async {
    final response = await ApiService.get('/booking/user/$userId');
    // The backend returns { "bookings": [...] } or array directly
    List data = response['bookings'] ?? response['data'] ?? response;
    if (data is! List) data = [];
    return data.map((json) => Booking.fromJson(json)).toList();
  }

  static Future<void> cancelBooking(int bookingId) async {
    await ApiService.put('/booking/cancel/$bookingId');
  }
}