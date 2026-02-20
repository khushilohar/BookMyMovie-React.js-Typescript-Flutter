import { Router } from "express";
import {
  addSeat,
  bulkCreateSeats,
  getAllSeats,
  getSeatsByHall,
  getSeatById,
  updateSeat,
  deleteSeat,
  deleteSeatsByHall,
  getAvailableSeats
} from "../controllers/seats_controller";

const seatsRouter = Router();

seatsRouter.post("/", addSeat);
seatsRouter.post("/bulk", bulkCreateSeats);
seatsRouter.get("/", getAllSeats);
seatsRouter.get("/hall/:hall_id", getSeatsByHall);
seatsRouter.get(
  "/available/:hall_id",
  getAvailableSeats
);
seatsRouter.get("/:id", getSeatById);
seatsRouter.put("/:id", updateSeat);
seatsRouter.delete("/:id", deleteSeat);
seatsRouter.delete(
  "/hall/:hall_id",
  deleteSeatsByHall
);

export default seatsRouter;
