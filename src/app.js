import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectionDB } from "./database/db.js";
import errrorMiddleware from "./middleware/errorMiddleware.js";
import userrouter from "./route/userRoute.js";

dotenv.config({ path: "./.env" });

export const app = express();

connectionDB();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [process.env.FRONTEND_URL],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use("/api/v1/auth", userrouter);

app.use(errrorMiddleware);
