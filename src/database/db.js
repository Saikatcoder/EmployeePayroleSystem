import mongoose from "mongoose";

export const connectionDB = async () => {
 await mongoose
    .connect(process.env.MONGO_URL, {
      dbName: "MEARN_AUTHENTICATION",
    })
    .then(() => {
      console.log("Connected to database");
    })
    .catch((err) => {
      console.log("Some errror occured while connectiong to databse", err);
    });
};
