import { Router } from "express";
import {
  signUp,
  resendOtp,
  verifyOtp,
  signIn,
  signOut,
  forgotPassword,
  resetPassword,
  getUser,
  changePassword,
} from "../controllers/user_controller";
import { verifyToken } from "../middleware/verify_token";

const userRouter = Router();
userRouter.post("/signup", signUp);
userRouter.post("/signin", signIn);
userRouter.post("/requestotp", resendOtp);
userRouter.post("/verifyotp", verifyOtp);
userRouter.get("/getuser", verifyToken, getUser);
userRouter.post("/change-password", verifyToken, changePassword);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.get("/signout", verifyToken, signOut);

export default userRouter;