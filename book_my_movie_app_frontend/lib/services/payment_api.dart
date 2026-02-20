class PaymentApi {
  static Future<Map<String, dynamic>> processPayment({
    required double amount,
    String? cardNumber,
    String? cardHolder,
    String? expiryDate,
    String? cvv,
    String? upiId,
    String? method,
  }) async {
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 2));
    return {
      'success': true,
      'transactionId': 'TXN${DateTime.now().millisecondsSinceEpoch}',
      'message': 'Payment processed successfully',
      'timestamp': DateTime.now().toIso8601String(),
    };
  }
}