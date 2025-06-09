import { app } from "./app.js";
import dotenv from 'dotenv';
import {connectionDB} from './database/db.js'



dotenv.config({ path: "./.env" });
connectionDB();

const PORT = process.env.PORT || 3000;



app.listen(PORT, (req, res) => {
  console.log(`server is running on port ${PORT}`);
});
