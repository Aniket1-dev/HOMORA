import 'dotenv/config';
import express from 'express';import cors from 'cors';import helmet from 'helmet';import morgan from 'morgan';import path from 'node:path';
import {prisma} from './db.js';import authRoutes from './modules/auth/routes.js';import entityRoutes from './modules/entities.js';import bookingRoutes from './modules/bookings/routes.js';import uploadRoutes from './modules/uploads/routes.js';
const app=express();app.use(helmet({crossOriginResourcePolicy:{policy:'cross-origin'}}));app.use(cors({origin:(process.env.CORS_ORIGINS||'http://localhost:5173').split(',').map(x=>x.trim()),credentials:true}));app.use(express.json({limit:'2mb'}));app.use(morgan('dev'));app.use('/uploads',express.static(path.resolve('uploads')));
app.get('/health',async(_req,res)=>{try{await prisma.$queryRaw`SELECT 1`;res.json({ok:true,service:'homora-api',database:'connected'});}catch{res.status(503).json({ok:false,service:'homora-api',database:'unavailable'});}});
app.use('/api/auth',authRoutes);app.use('/api/entities',entityRoutes);app.use('/api/bookings',bookingRoutes);app.use('/api/uploads',uploadRoutes);
app.use((err,_req,res,_next)=>{console.error(err);const status=err.status|| (err.name==='ZodError'?400:500);res.status(status).json({error:{message:status===500?'Internal server error':err.message,details:process.env.NODE_ENV==='development'?err.message:undefined}});});
const port=Number(process.env.PORT||4000);app.listen(port,()=>console.log(`HOMORA API listening on :${port}`));
process.on('SIGINT',async()=>{await prisma.$disconnect();process.exit(0)});
