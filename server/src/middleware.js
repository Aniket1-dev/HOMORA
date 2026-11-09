import jwt from 'jsonwebtoken';
import { prisma } from './db.js';
export function requireAuth(req,res,next){
  const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  if(!token) return res.status(401).json({error:{message:'Authentication required'}});
  try { req.auth=jwt.verify(token,process.env.JWT_ACCESS_SECRET); next(); }
  catch { return res.status(401).json({error:{message:'Session expired. Please sign in again.'}}); }
}
export function optionalAuth(req,res,next){
  const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  if(token) { try { req.auth=jwt.verify(token,process.env.JWT_ACCESS_SECRET); } catch {} }
  next();
}
export function allowRoles(...roles){return (req,res,next)=>{if(!req.auth || !roles.includes(req.auth.role)) return res.status(403).json({error:{message:'You do not have permission to perform this action'}}); next();};}
export async function assertPropertyAccess(user,propertyId){
  if(['admin','moderator'].includes(user.role)) return true;
  const p=await prisma.property.findUnique({where:{id:propertyId},select:{ownerId:true}});
  return p?.ownerId===user.sub;
}
