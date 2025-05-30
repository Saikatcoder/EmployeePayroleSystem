import ErrorHandler from "../middleware/errorMiddleware.js";
import { catchAsyncError } from "../models/catchAsyncError.js";
import {isValidPhoneNumber} from 'libphonenumber-js'
import { User } from "../models/usermodel.js";


export const register =  catchAsyncError(async(req, res, next)=>{
    try {
        const {name, email, password , phone, verificationMethod} = req.body;
        if(!name || !email || !password || !phone){
            res.next(new ErrorHandler("All fields are required",400))
        }
       if (!isValidPhoneNumber(phone)) {
        return next(new ErrorHandler("Invalid phone number format", 400));
    }
    const existingUser = await User.findOne({
        $or:[
            {
                email,
                accountVerified:true,
            },
            {
                phone,
                accountVerified:true
            }
        ],
    });
    if(existingUser){
        return next(new ErrorHandler("this phone/email alredy register",400))
    }
    const registerationAttemtsByUser = await User.find({
        $or:[
            {phone, accountVerified:false},
            {email,accountVerified:false},
        ]
    });
    if(registerationAttemtsByUser.length>3){
        return next(new ErrorHandler("You have exceeded the maximum number of attemps (3). please try again after an hour",400))
    }

    const userData = {
        name,
        email,
        phone,
        password
    };
    const user = await User.create(userData);
    const verificationCode = await user.generateVerificationCode();
    await user.save();
    sendVerificationCode(verificationMethod,verificationCode,email,phone);
    res.status(200).json({
        success:true,
    });
    
    } catch (error) {
        
    }
})