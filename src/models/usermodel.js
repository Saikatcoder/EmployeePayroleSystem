import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxLength: 30,
    minLength: 3,
    index: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"]
  },
  password: {
    type: String,
    minLength: [8, "Password must have at least 8 characters"],
    maxLength: [100, "Password cannot have more than 100 characters"]
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please enter confirm password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same"
    }
  },
  otp: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  },
  resetPasswordOtpExpires: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
 isVerified: {
  type: Boolean,
  default: false
}
}, {
  timestamps: true 
});


userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};


export const User = mongoose.models.User || mongoose.model("User", userSchema);
