import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/booking_api.dart';
import '../models/booking.dart';

class MyBookingsScreen extends StatefulWidget {
  const MyBookingsScreen({super.key});

  @override
  State<MyBookingsScreen> createState() => _MyBookingsScreenState();
}

class _MyBookingsScreenState extends State<MyBookingsScreen> {
  List<Booking> _bookings = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadBookings();
  }

  Future<void> _loadBookings() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (auth.user == null) {
      setState(() => _isLoading = false);
      return;
    }
    try {
      final bookings = await BookingApi.getBookingsByUser(auth.user!.id);
      setState(() {
        _bookings = bookings;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load bookings: $e')),
      );
    }
  }

  Future<void> _cancelBooking(int id) async {
    try {
      await BookingApi.cancelBooking(id);
      _loadBookings(); // refresh
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Booking cancelled')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Cancel failed: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Bookings')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _bookings.isEmpty
              ? const Center(child: Text('No bookings yet'))
              : ListView.builder(
                  itemCount: _bookings.length,
                  itemBuilder: (ctx, i) {
                    final b = _bookings[i];
                    return Card(
                      margin: const EdgeInsets.all(8),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Booking #${b.id}', style: const TextStyle(fontWeight: FontWeight.bold)),
                            Text('Movie: ${b.movieId}'), // ideally we would fetch title
                            Text('Hall: ${b.hallId}'),
                            Text('Date: ${b.bookingDate}  Slot: ${b.slotSelected}'),
                            Text('Seats: ${b.seatsSelected}'),
                            Text('Amount: ₹${b.totalAmount.toStringAsFixed(2)}'),
                            Text('Status: ${b.bookingStatus}'),
                            if (b.bookingStatus != 'CANCELLED')
                              TextButton(
                                onPressed: () => _cancelBooking(b.id),
                                child: const Text('Cancel', style: TextStyle(color: Color.fromRGBO(244, 67, 54, 1))),
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}