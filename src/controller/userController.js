import ErrorHandler from "../middleware/errorMiddleware.js";
import { catchAsyncError } from "../models/catchAsyncError.js";
import { User } from "../models/usermodel.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { sendEmail} from "../utils/sendEmail.js";
import { generateOtp } from "../utils/generateOtp.js";


const signToken = (id)=>{
  return jwt.sign({id},process.env.JWT_SECRET,{
    expiresIn:process.env.JWT_SECRET_EXPIRE
  })
}
const createSendToken = (user , statusCode , res, message)=>{
  const token = signToken(user._id);

  const cookieOptions = {
    expires:new Date(Date.now() + process.env.JWT_COOKIE_EXPIREIN * 24 * 60 * 60 *1000),
    httpOnly:true,
    secure:process.env.NODE_ENV === 'production', 
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : "Lax"
  };
  res.cookie('token',token ,cookieOptions)
  user.password = undefined;
  user.passwordConfirm = undefined;
  user.otp = undefined;

  res.status(statusCode).json({
    status:'success',
    message,
    token,
    data:{
      user
    }
  })
}


// REGISTER
export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password ,  passwordConfirm} = req.body;

  if (!name || !email || !password || !passwordConfirm) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(new ErrorHandler("This email is already registered", 400));
  }

  const otp = generateOtp();
  const otpExpires = Date.now() + 10 * 60 * 1000; 


  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    passwordConfirm :hashedPassword,
    otp,
    otpExpires,
  });

  try {
    await sendEmail({
      email:user.email,
      subject:"OTP for email verification",
      html:`<div style="font-family: Arial, sans-serif; padding: 20px; background: #f7f7f7;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <h2 style="text-align: center; color: #333;">🔐 Email Verification</h2>
        <p style="font-size: 16px; color: #555;">
          Hello,<br/><br/>
          Your OTP for email verification is:
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; background: #efefef; padding: 10px 20px; border-radius: 5px; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #888;">
          This OTP is valid for 10 minutes. Please do not share it with anyone.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #aaa; text-align: center;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    </div>`
    })

    createSendToken(user,200, res, "Registration sucessfully")
  } catch (error) {
  await User.findByIdAndDelete(user.id);
    return next(new ErrorHandler("There is an error sending the email", 500))
  }

  // Generate and save OTP here
});


export const verifyAccount = catchAsyncError(async (req, res, next)=>{
  const {otp} = req.body
  if(!otp){
    return next(new ErrorHandler("OTP is missing", 400))
  }
  const user = req.user;

  if(user.otp != otp){
    return next(new ErrorHandler("Invalid otp", 400))
  }
  if(Date.now() > user.otpExpires){
    return next(new ErrorHandler("otp has expired .pleased request a new otp",400))
  }

  user.isVerified = true;
  user.otp= undefined;
  user.otpExpires= undefined;

  await user.save({validateBeforeSave:false})
  createSendToken(user,200,res, "Email has been verified")
})

export const resendOtp = catchAsyncError(async(req, res, next)=>{
  const {email} = req.user;
  if(!email){
    return next(new ErrorHandler("Eamil is required to resend otp",400))
  }
  const user = await User.findOne({email})
  if(!user){
    return next(new ErrorHandler("user not found",404))
  }
  if(user.isVerified){
    return next(new ErrorHandler("user is already verified ",400))
  }
  const newOtp = generateOtp();
  user.otp = newOtp;
  user.otpExpires = Date.now() + 10 * 60 * 1000; 

  await user.save({validateBeforeSave:false})

   try {
    await sendEmail({
      email:user.email,
      subject:"OTP for email verification",
      html:`<div style="font-family: Arial, sans-serif; padding: 20px; background: #f7f7f7;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <h2 style="text-align: center; color: #333;">🔐 Email Verification</h2>
        <p style="font-size: 16px; color: #555;">
          Hello,<br/><br/>
          Your OTP for email verification is:
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; background: #efefef; padding: 10px 20px; border-radius: 5px; display: inline-block;">
            ${newOtp}
          </span>
        </div>
        <p style="font-size: 14px; color: #888;">
          This OTP is valid for 10 minutes. Please do not share it with anyone.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #aaa; text-align: center;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    </div>`
    })

    res.status(200).json({
      status:success,
      message:"A new otp send to your email"
    })
  } catch (error) {
    user.otp = undefined
    user.otpExpires = undefined;

  await user.save({validateBeforeSave:false});
    return next(new ErrorHandler("Error sending email ! please resend it ",500))
  }
})


export const login = catchAsyncError(async(req,res,next)=>{
  const {email, password}= req.body;

  if(!email || !password){
    return next(new ErrorHandler("PLease provide valid email or password",400))
  }
 const user = await User.findOne({ email }).select('+password');
  if(!user || !(await user.correctPassword(password, user.password))){
    return next(new ErrorHandler("Incorrect email and password",401))
  }
  createSendToken(user,200,res,"Login Successful")
});


export const logOut =  catchAsyncError(async(req, res, next)=>{
  res.cookie("token", "loggedout",{
    expires:new Date(Date.now() +10 *1000),
    httpOnly:true,
    secure:process.env.NODE_ENV === 'production',
  });

  res.status(200).json({
    status:"success",
    message:"logout sucessfully"
  })
})