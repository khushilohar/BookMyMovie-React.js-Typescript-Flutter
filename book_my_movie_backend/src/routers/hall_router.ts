import { Router } from "express";
import {
  addHall,
  getAllHalls,
  getHallById,
  updateHall,
  deleteHall,
  searchHalls
} from "../controllers/hall_controller";

const hallRouter = Router();

hallRouter.post("/", addHall);
hallRouter.get("/", getAllHalls);
hallRouter.get("/search", searchHalls);
hallRouter.get("/:id", getHallById);
hallRouter.put("/:id", updateHall);
hallRouter.delete("/:id", deleteHall);

export default hallRouter;