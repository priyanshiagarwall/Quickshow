import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
import showRouter from './routes/showRoutes.js';

dotenv.config();

const app=express();
const port= process.env.PORT || 3000;

connectDB();

//Middleware
app.use(express.json())
app.use(cors())
app.use(clerkMiddleware())


//API routes
app.get('/',(req,res)=> res.send('Server is Live!'))
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use('/api/show',showRouter)


app.listen(port,()=> console.log(`Server listeening at http://localhost:${port}`));