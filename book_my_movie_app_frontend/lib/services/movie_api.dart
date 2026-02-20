import 'api_service.dart';
import '../models/movie.dart';

class MovieApi {
  static Future<List<Movie>> getAllMovies() async {
    final response = await ApiService.get('/movie/get-all-movies');
    final List data = response['movies'] ?? [];
    return data.map((json) => Movie.fromJson(json)).toList();
  }

  static Future<Movie> getMovieById(int id) async {
    final response = await ApiService.get('/movie/$id');
    final data = response['movie'] ?? response;
    return Movie.fromJson(data);
  }
}