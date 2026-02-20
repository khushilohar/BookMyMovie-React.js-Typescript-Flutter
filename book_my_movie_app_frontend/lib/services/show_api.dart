import 'api_service.dart';
import '../models/show.dart';

class ShowApi {
  static Future<List<dynamic>> getHallDateSlotByMovieId(int movieId) async {
    final response = await ApiService.get('/showmovie?movie_id=$movieId');
 
    return response is List ? response : [];
  }

static Future<List<dynamic>> getShowsRaw(int movieId) async {
    final response = await ApiService.get('/showmovie?movie_id=$movieId');
    return response is List ? response : [];
  }


  static Future<List<Show>> getShows(int movieId) async {
    final raw = await getShowsRaw(movieId);
    return raw.map((json) => Show.fromJson(json)).toList();
  }


  static Future<List<String>> getAvailableDates(int movieId) async {
    final shows = await getShowsRaw(movieId);
    final dates = shows.map<String>((s) => s['show_date'].toString()).toSet().toList();
    dates.sort();
    return dates;
  }

  static Future<List<int>> getHallIdsForDate(int movieId, String date) async {
    final shows = await getShowsRaw(movieId);
    final halls = shows
        .where((s) => s['show_date'] == date)
        .map<int>((s) => s['hall_id'] as int)
        .toSet()
        .toList();
    return halls;
  }


  static Future<List<String>> getSlotsForHallAndDate(int movieId, int hallId, String date) async {
    final shows = await getShowsRaw(movieId);
    final slots = shows
        .where((s) => s['show_date'] == date && s['hall_id'] == hallId)
        .map<String>((s) => s['slot'].toString())
        .toSet()
        .toList();
    slots.sort();
    return slots;
  }
}