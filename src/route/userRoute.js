import express from 'express';
import {  login, logOut, register, resendOtp, verifyAccount } from '../controller/userController.js';
import {  isAuthenticated } from '../middleware/isAuthencation.js';


const userrouter = express.Router();

userrouter.post("/register", register);
userrouter.post("/verify", isAuthenticated,verifyAccount);
userrouter.post("/resend-otp", isAuthenticated,resendOtp);
userrouter.post("/login",login)
userrouter.post('/logout',logOut)
userrouter.get("/me", isAuthenticated, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user, // `req.user` me authenticated user ka data hota hai
  });
});
export default userrouter;


