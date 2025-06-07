import express from 'express';
import { login, logOut, register, sendVerificationOtp, verifyEmail } from '../controller/userController.js';
import userAuth from '../middleware/userAuth.js';

const userrouter = express.Router();

userrouter.post("/register", register);
userrouter.post("/login", login);
userrouter.post("/logout", logOut);
userrouter.post("/send-verify-otp", userAuth, sendVerificationOtp);
userrouter.post("/verify-account", userAuth, verifyEmail);

export default userrouter;
