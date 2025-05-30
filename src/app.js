import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import {connection} from './database/db.js'
import errrorMiddleware from './middleware/errorMiddleware.js'
dotenv.config({
    path:"./.env"
});
export const app = express()

app.use('/', (req, res)=>{
    cors({
        origin:[process.env.FRONTEND_URL],
        methods:["GET","POST","PUT","DELETE"],
        credentials:true,
    })
})

app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({extended:true}))

connection()

app.use(errrorMiddleware)

