import pool from "./config/db";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
const PORT = process.env.PORT;
import cors from "cors";
import userRouter from "./routers/user_router";
import movieRouter from "./routers/movie_router";
import hallRouter from "./routers/hall_router";
import seatsRouter from "./routers/seats_router";
import bookingRouter from "./routers/booking_router";
import { verifyToken } from "./middleware/verify_token";
import showMovieHallRouter from "./routers/showMovieHall_router"
app.use(
    cors({
        origin: ["http://10.0.2.2:5000", "http://localhost:3000"],
        credentials: true,
    })
);
//body parser
app.use(express.json());
//router
app.use("/user", userRouter);
app.use("/movie", movieRouter);
app.use("/hall", hallRouter);
app.use("/seats", seatsRouter);
app.use("/booking", verifyToken, bookingRouter);
app.use("/showmovie", showMovieHallRouter);

const testConection = async () => {
    try {
        await pool.execute("SELECT 1");
        console.log("DB Connected");
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        })
    } catch(error) {
        console.error("DB Connection Failled:",error);
    }
};
testConection();