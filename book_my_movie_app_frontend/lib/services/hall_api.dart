import 'api_service.dart';
import '../models/hall.dart';

class HallApi {
  static Future<Hall> getHallById(int id) async {
    final response = await ApiService.get('/hall/$id');
    final data = response['hall'] ?? response;
    return Hall.fromJson(data);
  }
}