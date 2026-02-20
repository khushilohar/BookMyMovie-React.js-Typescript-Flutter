import { Router } from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingsByUser,
  getBookingsByMovie,
  getBookingsByHallSlot,
  cancelBooking,
  updatePaymentStatus,
  getBookingHistory,
  getRevenueSummary,
  checkSeatAvailability
} from "../controllers/booking_controller";

const bookingRouter = Router();

bookingRouter.post("/", createBooking);
bookingRouter.get("/", getAllBookings);
bookingRouter.get(
  "/history/:user_id",
  getBookingHistory
);
bookingRouter.get(
  "/user/:user_id",
  getBookingsByUser
);
bookingRouter.get(
  "/movie/:movie_id",
  getBookingsByMovie
);
bookingRouter.get(
  "/hall/:hall_id",
  getBookingsByHallSlot
);
bookingRouter.get(
  "/check-seats",
  checkSeatAvailability
);
bookingRouter.put(
  "/payment/:id",
  updatePaymentStatus
);
bookingRouter.put(
  "/cancel/:id",
  cancelBooking
);
bookingRouter.get(
  "/revenue",
  getRevenueSummary
);
bookingRouter.get("/:id", getBookingById);

export default bookingRouter;
