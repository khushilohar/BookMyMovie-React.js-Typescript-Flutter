import 'api_service.dart';
import '../models/user.dart';

class UserApi {
  static Future<Map<String, dynamic>> signUp({
    required String name,
    required String email,
    required String password,
  }) async {
    final response = await ApiService.post('/user/signup', body: {
      'name': name,
      'email': email,
      'password': password,
    });
    return response;
  }

  static Future<Map<String, dynamic>> signIn({
    required String email,
    required String password,
    required bool rememberMe,
  }) async {
    final response = await ApiService.post('/user/signin', body: {
      'email': email,
      'password': password,
      'rememberMe': rememberMe,
    });
    return response;
  }

  static Future<Map<String, dynamic>> verifyOtp({
    required String email,
    required String otp,
  }) async {
    final response = await ApiService.post('/user/verifyotp', body: {
      'email': email,
      'otp': otp,
    });
    return response;
  }

  static Future<Map<String, dynamic>> resendOtp({required String email}) async {
    final response = await ApiService.post('/user/requestotp', body: {
      'email': email,
    });
    return response;
  }

  static Future<Map<String, dynamic>> forgotPassword({required String email}) async {
    final response = await ApiService.post('/user/forgot-password', body: {
      'email': email,
    });
    return response;
  }

  static Future<Map<String, dynamic>> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    final response = await ApiService.post('/user/reset-password', body: {
      'token': token,
      'newPassword': newPassword,
    });
    return response;
  }

  static Future<User> getUser() async {
    final response = await ApiService.get('/user/getuser');
    return User.fromJson(response);
  }

  static Future<void> signOut() async {
    await ApiService.get('/user/signout');
  }
}