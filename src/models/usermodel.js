// import mongoose from "mongoose";
// import bcrypt from "bcrypt";

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, "Name is required"]
//   },
//   email: {
//     type: String,
//     required: [true, "Email is required"],
//     unique: true
//   },
//   password: {
//     type: String,
//     required: [true, "Password is required"],
//     minLength: [8, "Password must have at least 8 characters"],
//     maxLength: [100, "Password cannot have more than 32 characters"], 
//   },
//   verificationOtp: Number,
//   verificationCodeExpireAt: {
//     type: Number,
//     default: 0
//   },
//   isAccountVerified: {   
//     type: Boolean,
//     default: false
//   },
//   resetOtp: {
//     type: String,
//     default: ''
//   },
//   resetOtpExpireAt: {
//     type: Number,
//     default: 0
//   }
// });

// 🔐 Password Hashing
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
// });

// // 🔁 Compare Password
// userSchema.methods.comparePassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// // 🔢 Generate OTP
// userSchema.methods.generateVerificationCode = function () {
//   const generateRandomFiveDigitNumber = () => {
//     const firstDigit = Math.floor(Math.random() * 9) + 1;
//     const remainingDigits = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
//     return parseInt(firstDigit + remainingDigits);
//   };

//   const verificationCode = generateRandomFiveDigitNumber();
//   this.verificationOtp = verificationCode;
//   this.verificationCodeExpireAt = Date.now() + 5 * 60 * 1000; // 5 minutes

//   return verificationCode;
// };

// // ✅ Model Export
// export const User = mongoose.models.User || mongoose.model("User", userSchema);





import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true
  },
  password: {
    type: String,
    minLength: [8, "Password must have at least 8 characters"],
    maxLength: [100, "Password cannot have more than 32 characters"],
  },
  verificationOtp: Number,
  verificationCodeExpireAt: { type: Number, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: '' },
  resetOtpExpireAt: { type: Number, default: 0 },
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
