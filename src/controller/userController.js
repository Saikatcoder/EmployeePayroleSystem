import ErrorHandler from "../middleware/errorMiddleware.js";
import { catchAsyncError } from "../models/catchAsyncError.js";
import { User } from "../models/usermodel.js";
// import { sendEmail } from "../utils/sendEmail.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { transporter } from "../utils/sendEmail.js";

// REGISTER
export const register = catchAsyncError(async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new ErrorHandler("All fields are required", 400));
    }

    const existingUser = await User.findOne({
      email,
      isAccountVerified: true,
    });

    if (existingUser) {
      return ("This email is already registered", 400);
    }

    const hashedPassword = await bcrypt.hash(password,10);

    const unverifiedAttempts = await User.find({
      email,
      isAccountVerified: false,
    });

    if (unverifiedAttempts.length > 3) {
      return next(
        new ErrorHandler(
          "You have exceeded the maximum number of attempts (3). Please try again after an hour.",
          400
        )
      );
    }

    const user = await User.create({ name, email, password:hashedPassword });
  
    // const verificationCode = await user.generateVerificationCode();


   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });



    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // await sendVerificationCode(sendVerificationCode, email);
      try {
        const options = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject :'welcome to our company',
    text: `Welcome to our company website .Your account has been created with email id:${email}`,
  };

  await transporter.sendMail(options)

      } catch (error) {
        console.error("eamil not send:", error);
      return next(new ErrorHandler("Something went wrong", 500));
      }

    await user.save();
    res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
    });

  } catch (error) {
    console.error("Register error:", error);
    return next(new ErrorHandler("Something went wrong", 500));
  }
});


// LOGIN
export const login = catchAsyncError(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("All fields are required", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorHandler("Invalid email", 400));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(new ErrorHandler("Invalid password", 400));
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    return next(new ErrorHandler("Failed to login", 500));
  }
});

// LOGOUT
export const logOut = catchAsyncError(async (req, res, next) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });

    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return next(new ErrorHandler("Failed to log out", 500));
  }
});

// Send Verification Email
export const sendVerificationOtp = async (req, res) => {
  try {
    const userId = req.userId; // ✅ get from middleware
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerified) {
      return res.status(208).json({
        success: false,
        message: "User already verified"
      });
    }

    const otp = generateRandomFiveDigitNumber();
    user.verificationOtp = otp;
    user.verificationCodeExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const options = {
      from: process.env.SMTP_MAIL,
      to: user.email, // ✅ fixed this too
      subject: 'Welcome to our company',
      html: ` <div style="max-width:600px; margin:0 auto; padding:20px; border:1px solid #ddd; border-radius:8px; background-color:#f9f9f9">
      <h2 style="color:#4CAF50; text-align:center;">Verification Code</h2>
      <p style="font-size:16px; color:#333">Dear User,</p>
      <p style="font-size:16px; color:#333">Your verification code is:</p>
      <div style="text-align: center; margin:20px 0">
        <span style="display:inline-block; font-size:24px; font-weight:bold; color:#4CAF50; padding:10px 20px; border:1px solid #4CAF50; border-radius:5px; background-color:#e8f5e9;">
          ${otp}
        </span>
      </div>
      <p style="font-size:16px; color:#333;">Please use this code to verify your email address. This code will expire in 10 minutes.</p>
      <p style="font-size:16px; color:#333;">If you did not request this, please ignore this email.</p>
      <footer style="margin-top:20px; text-align:center; font-size:14px; color:#999">
        <p>Thank you,<br />Your Company Team</p>
        <p style="font-size:12px; color:#aaa;">This is an automated message. Please do not reply to this email.</p>
      </footer>
    </div>`
    };

    await transporter.sendMail(options);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully"
    });

  } catch (error) {
    console.error("OTP send error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending verification OTP"
    });
  }
};


const generateRandomFiveDigitNumber = () => {
  const firstDigit = Math.floor(Math.random() * 9) + 1;
  const remainingDigits = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return parseInt(firstDigit + remainingDigits);
};



export const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.userId;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "Missing user ID or OTP",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.verificationOtp === '' || user.verificationOtp != otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.verificationCodeExpireAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    user.isAccountVerified = true;
    user.verificationOtp = '';
    user.verificationCodeExpireAt = 0;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });

  } catch (error) {
    console.error("verifyEmail error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



export const isAuthenticated = async (req, res)=>{
  
}

export const sendResetOtp = async(req, res)=>{

}

