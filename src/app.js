import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import errrorMiddleware from "./middleware/errorMiddleware.js";
import userrouter from "./route/userRoute.js";



export const app = express();

app.use(cookieParser())

app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(express.json({limit:"10kb"}));

// user api urls

app.use("/api/v1/auth", userrouter);

app.use(errrorMiddleware);



