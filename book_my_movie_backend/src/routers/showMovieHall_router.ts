import { Router } from "express";
import {
    addShowMovie,
    getHallDateSlotByMovieId,
    getDateSlotByMovieHall,
    getHallSlotByMovieDate,
    getHallDateByMovieSlot,
    getSlotByMovieHallDate,
    getHallByMovieSlotDate,
    getDateByMovieHallSlot
} from "../controllers/showMovieHall_controller";


const showMovieHallRouter = Router();

showMovieHallRouter.post("/add", addShowMovie);
showMovieHallRouter.get("/", getHallDateSlotByMovieId);
showMovieHallRouter.get("/", getDateSlotByMovieHall);
showMovieHallRouter.get("/", getHallSlotByMovieDate);
showMovieHallRouter.get("/", getHallDateByMovieSlot);
showMovieHallRouter.get("/", getSlotByMovieHallDate);
showMovieHallRouter.get("/", getHallByMovieSlotDate);
showMovieHallRouter.get("/", getDateByMovieHallSlot);

export default showMovieHallRouter;