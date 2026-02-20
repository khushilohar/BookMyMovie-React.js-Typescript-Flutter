import 'package:flutter/material.dart';
import '../models/movie.dart';
import '../models/hall.dart';
import '../models/seat.dart';
import '../services/hall_api.dart';
import '../services/show_api.dart';
import '../services/seat_api.dart';
import 'payment_screen.dart';

class BookingScreen extends StatefulWidget {
  final Movie movie;
  const BookingScreen({super.key, required this.movie});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  // Step state
  List<String> _availableDates = [];
  String? _selectedDate;
  List<Hall> _availableHalls = [];
  Hall? _selectedHall;
  List<String> _availableSlots = [];
  String? _selectedSlot;

  // Seats state
  List<Seat> _allSeats = [];
  List<String> _bookedSeatNumbers = [];
  Set<String> _selectedSeats = {};

  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    setState(() => _isLoading = true);
    try {
      final dates = await ShowApi.getAvailableDates(widget.movie.id);
      setState(() {
        _availableDates = dates;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load shows: $e')),
      );
    }
  }

  Future<void> _loadHallsForDate(String date) async {
    setState(() => _isLoading = true);
    try {
      final hallIds = await ShowApi.getHallIdsForDate(widget.movie.id, date);
      final halls = await Future.wait(hallIds.map((id) => HallApi.getHallById(id)));
      setState(() {
        _availableHalls = halls;
        _selectedHall = null;
        _availableSlots = [];
        _selectedSlot = null;
        _allSeats = [];
        _bookedSeatNumbers = [];
        _selectedSeats.clear();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load halls: $e')),
      );
    }
  }

  Future<void> _loadSlotsForHall(Hall hall) async {
    setState(() => _isLoading = true);
    try {
      final slots = await ShowApi.getSlotsForHallAndDate(
        widget.movie.id,
        hall.id,
        _selectedDate!,
      );
      setState(() {
        _availableSlots = slots;
        _selectedSlot = null;
        _allSeats = [];
        _bookedSeatNumbers = [];
        _selectedSeats.clear();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load slots: $e')),
      );
    }
  }

  Future<void> _loadSeatsForSlot(String slot) async {
    setState(() => _isLoading = true);
    try {
      final seats = await SeatApi.getSeatsByHall(_selectedHall!.id);
      final booked = await SeatApi.getBookedSeatNumbers(
        movieId: widget.movie.id,
        hallId: _selectedHall!.id,
        bookingDate: _selectedDate.toString().substring(0, 10),
        slotSelected: slot,
      );
      setState(() {
        _allSeats = seats;
        _bookedSeatNumbers = booked;
        _selectedSlot = slot;
        _selectedSeats.clear();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load seats: $e')),
      );
    }
  }

  void _toggleSeat(String seatNumber) {
    if (_bookedSeatNumbers.contains(seatNumber)) return;
    setState(() {
      if (_selectedSeats.contains(seatNumber)) {
        _selectedSeats.remove(seatNumber);
      } else {
        _selectedSeats.add(seatNumber);
      }
    });
  }

  double get _totalPrice {
    double total = 0;
    for (var seat in _allSeats) {
      if (_selectedSeats.contains(seat.seatNumber)) {
        total += seat.price;
      }
    }
    return total;
  }

  void _proceedToPayment() {
    if (_selectedSeats.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Select at least one seat')),
      );
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => PaymentScreen(
          movie: widget.movie,
          hall: _selectedHall!,
          date: _selectedDate.toString().substring(0, 10),
          slot: _selectedSlot!,
          selectedSeats: _selectedSeats.toList(),
          totalAmount: _totalPrice,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Book ${widget.movie.title}')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Step 1: Date
                  const Text('Select Date', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: _availableDates.map((date) {
                      return ChoiceChip(
                        label: Text(date.toString().substring(0, 10)),
                        selected: _selectedDate == date,
                        onSelected: (selected) {
                          if (selected) {
                            setState(() {
                              _selectedDate = date;
                              _availableHalls = [];
                              _selectedHall = null;
                              _availableSlots = [];
                              _selectedSlot = null;
                              _allSeats = [];
                              _bookedSeatNumbers = [];
                              _selectedSeats.clear();
                            });
                            _loadHallsForDate(date);
                          }
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),

                  // Step 2: Hall (only if date selected)
                  if (_selectedDate != null) ...[
                    const Text('Select Hall', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: _availableHalls.map((hall) {
                        return ChoiceChip(
                          label: Text(hall.hallName),
                          selected: _selectedHall?.id == hall.id,
                          onSelected: (selected) {
                            if (selected) {
                              setState(() {
                                _selectedHall = hall;
                                _availableSlots = [];
                                _selectedSlot = null;
                                _allSeats = [];
                                _bookedSeatNumbers = [];
                                _selectedSeats.clear();
                              });
                              _loadSlotsForHall(hall);
                            }
                          },
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Step 3: Slot
                  if (_selectedHall != null) ...[
                    const Text('Select Slot', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: _availableSlots.map((slot) {
                        return ChoiceChip(
                          label: Text(slot),
                          selected: _selectedSlot == slot,
                          onSelected: (selected) {
                            if (selected) {
                              _loadSeatsForSlot(slot);
                            }
                          },
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Step 4: Seat selection
                  if (_selectedSlot != null && _allSeats.isNotEmpty) ...[
                    const Text('Select Seats', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                    const SizedBox(height: 8),
                    // Legend
                    Row(
                      children: [
                        _legendItem(Colors.green, 'Available'),
                        const SizedBox(width: 16),
                        _legendItem(Colors.blue, 'Selected'),
                        const SizedBox(width: 16),
                        _legendItem(Colors.red, 'Booked'),
                      ],
                    ),
                    const SizedBox(height: 20),
                    // Seat grid grouped by row as columns
                    ..._buildSeatGrid(),
                    const SizedBox(height: 20),
                    // Total and Proceed
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Total: ₹${_totalPrice.toStringAsFixed(2)}',
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        ElevatedButton(
                          onPressed: _proceedToPayment,
                          child: const Text('Proceed to Payment'),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
    );
  }

  Widget _legendItem(Color color, String label) {
    return Row(
      children: [
        Container(width: 16, height: 16, color: color),
        const SizedBox(width: 4),
        Text(label),
      ],
    );
  }

  // Updated method: displays seats in columns (A, B, C) with seat numbers and prices
  List<Widget> _buildSeatGrid() {
    // Group seats by row letter (first character)
    Map<String, List<Seat>> rows = {};
    for (var seat in _allSeats) {
      String row = seat.seatNumber[0];
      rows.putIfAbsent(row, () => []).add(seat);
    }

    // Sort rows alphabetically (A, B, C...)
    var sortedRows = rows.keys.toList()..sort();

    // For each row, sort seats by the numeric part of seatNumber
    for (var row in sortedRows) {
      rows[row]!.sort((a, b) {
        int numA = int.parse(a.seatNumber.substring(0, a.seatNumber.length - 1));
        int numB = int.parse(b.seatNumber.substring(0, b.seatNumber.length - 1));
        return numA.compareTo(numB);
      });
    }

    // Determine max seats per row (assume all rows have same count)
    int maxSeats = rows.values.map((list) => list.length).fold(0, (max, len) => len > max ? len : max);

    List<Widget> columnWidgets = [];

    // Add column headers (A, B, C...)
    // columnWidgets.add(
    //   Row(
    //     children: sortedRows.map((row) => Expanded(
    //       child: Center(
    //         child: Text(
    //           row,
    //           style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
    //         ),
    //       ),
    //     )).toList(),
    //   ),
    // );

    // Add rows of seats (1..maxSeats)
    for (int i = 0; i < maxSeats; i++) {
      columnWidgets.add(
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Row(
            children: sortedRows.map((row) {
              if (i < rows[row]!.length) {
                Seat seat = rows[row]![i];
                final bool isBooked = _bookedSeatNumbers.contains(seat.seatNumber);
                final bool isSelected = _selectedSeats.contains(seat.seatNumber);
                Color color = isBooked ? Colors.red : (isSelected ? Colors.blue : Colors.green);
                return Expanded(
                  child: GestureDetector(
                    onTap: isBooked ? null : () => _toggleSeat(seat.seatNumber),
                    child: Column(
                      children: [
                        Container(
                          width: 35,
                          height: 30,
                          decoration: BoxDecoration(
                            color: color,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Center(
                            child: Text(
                              seat.seatNumber,
                              style: const TextStyle(color: Colors.white, fontSize: 11),
                            ),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '₹${seat.price.toStringAsFixed(0)}',
                          style: TextStyle(
                            fontSize: 9,
                            color: isBooked ? Colors.grey : Colors.black,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              } else {
                // Empty cell for padding
                return const Expanded(child: SizedBox());
              }
            }).toList(),
          ),
        ),
      );
    }

    return columnWidgets;
  }
}