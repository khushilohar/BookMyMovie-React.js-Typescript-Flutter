import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/movie.dart';
import '../models/hall.dart';
import '../providers/auth_provider.dart';
import '../services/payment_api.dart';
import '../services/booking_api.dart';
import 'my_bookings_screen.dart';

class PaymentScreen extends StatefulWidget {
  final Movie movie;
  final Hall hall;
  final String date;
  final String slot;
  final List<String> selectedSeats;
  final double totalAmount;

  const PaymentScreen({
    super.key,
    required this.movie,
    required this.hall,
    required this.date,
    required this.slot,
    required this.selectedSeats,
    required this.totalAmount,
  });

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  int _selectedMethod = 0; // 0 = card, 1 = upi

  // Card fields
  final _cardNumberController = TextEditingController();
  final _cardHolderController = TextEditingController();
  final _expiryController = TextEditingController();
  final _cvvController = TextEditingController();

  // UPI field
  final _upiIdController = TextEditingController();

  bool _isProcessing = false;

  @override
  void dispose() {
    _cardNumberController.dispose();
    _cardHolderController.dispose();
    _expiryController.dispose();
    _cvvController.dispose();
    _upiIdController.dispose();
    super.dispose();
  }

  Future<void> _processPayment() async {
    // Basic validation
    if (_selectedMethod == 0) {
      if (_cardNumberController.text.isEmpty ||
          _cardHolderController.text.isEmpty ||
          _expiryController.text.isEmpty ||
          _cvvController.text.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please fill all card details')),
        );
        return;
      }
    } else {
      if (_upiIdController.text.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please enter UPI ID')),
        );
        return;
      }
    }

    setState(() => _isProcessing = true);

    try {
      // 1. Fake payment
      final paymentResult = await PaymentApi.processPayment(
        amount: widget.totalAmount,
        cardNumber: _cardNumberController.text,
        cardHolder: _cardHolderController.text,
        expiryDate: _expiryController.text,
        cvv: _cvvController.text,
        upiId: _upiIdController.text,
        method: _selectedMethod == 0 ? 'card' : 'upi',
      );

      if (paymentResult['success'] == true) {
        // 2. Create booking
        final auth = Provider.of<AuthProvider>(context, listen: false);
        if (auth.user == null) throw Exception('User not logged in');

        await BookingApi.createBooking(
          userId: auth.user!.id,
          movieId: widget.movie.id,
          hallId: widget.hall.id,
          slotSelected: widget.slot,
          bookingDate: widget.date,
          seatsSelected: widget.selectedSeats.join(','),
          totalSeats: widget.selectedSeats.length,
          totalAmount: widget.totalAmount,
        );

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Booking confirmed!')),
          );
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const MyBookingsScreen()),
          );
        }
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Payment/booking failed: $e')),
      );
    } finally {
      setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Payment')),
      body: _isProcessing
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Booking summary
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Movie: ${widget.movie.title}', style: const TextStyle(fontWeight: FontWeight.bold)),
                          Text('Hall: ${widget.hall.hallName}'),
                          Text('Date: ${widget.date}  Slot: ${widget.slot}'),
                          Text('Seats: ${widget.selectedSeats.join(', ')}'),
                          Text('Total: ₹${widget.totalAmount.toStringAsFixed(2)}'),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Payment method tabs
                  Row(
                    children: [
                      Expanded(
                        child: ChoiceChip(
                          label: const Text('Card'),
                          selected: _selectedMethod == 0,
                          onSelected: (s) => setState(() => _selectedMethod = 0),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ChoiceChip(
                          label: const Text('UPI'),
                          selected: _selectedMethod == 1,
                          onSelected: (s) => setState(() => _selectedMethod = 1),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Card form
                  if (_selectedMethod == 0) ...[
                    TextField(
                      controller: _cardNumberController,
                      decoration: const InputDecoration(labelText: 'Card Number'),
                      keyboardType: TextInputType.number,
                      maxLength: 19,
                    ),
                    TextField(
                      controller: _cardHolderController,
                      decoration: const InputDecoration(labelText: 'Card Holder Name'),
                    ),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _expiryController,
                            decoration: const InputDecoration(labelText: 'Expiry (MM/YY)'),
                            maxLength: 5,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            controller: _cvvController,
                            decoration: const InputDecoration(labelText: 'CVV'),
                            obscureText: true,
                            maxLength: 4,
                          ),
                        ),
                      ],
                    ),
                  ],

                  // UPI form
                  if (_selectedMethod == 1) ...[
                    TextField(
                      controller: _upiIdController,
                      decoration: const InputDecoration(labelText: 'UPI ID'),
                    ),
                  ],

                  const SizedBox(height: 30),
                  Center(
                    child: ElevatedButton(
                      onPressed: _processPayment,
                      child: Text('Pay ₹${widget.totalAmount.toStringAsFixed(2)}'),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}