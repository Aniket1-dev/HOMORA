import { Router } from 'express';
import { prisma } from '../../db.js';
import { requireAuth, allowRoles } from '../../middleware.js';
const router=Router();router.use(requireAuth);
router.post('/manage',async(req,res,next)=>{try{const {action,bookingId,propertyId,bedId,startDate,endDate,moveInDate,tenantName,phone,email}=req.body;
 if(action==='request'||action==='create'){
  if(!propertyId)return res.status(400).json({error:{message:'Property is required'}});
  const result=await prisma.$transaction(async tx=>{
   let bed=null;if(bedId){bed=await tx.bed.findFirst({where:{id:bedId,propertyId,status:'available'}});if(!bed)throw Object.assign(new Error('This bed is no longer available'),{status:409});const changed=await tx.bed.updateMany({where:{id:bedId,status:'available'},data:{status:'reserved'}});if(changed.count!==1)throw Object.assign(new Error('This bed was just reserved by someone else'),{status:409});}
   return tx.booking.create({data:{tenantId:req.auth.sub,propertyId,bedId:bed?.id||null,status:'requested',startDate:(startDate||moveInDate)?new Date(startDate||moveInDate):null,endDate:endDate?new Date(endDate):null,monthlyPrice:bed?.monthlyRent||bed?.price||null,tenantName:tenantName||null,phone:phone||null,email:email||null,paymentStatus:'pending',reference:`HM-${Date.now().toString(36).toUpperCase()}`}});
  });return res.status(201).json({booking:{...result,monthlyRent:result.monthlyPrice,deposit:0}});
 }
 const booking=await prisma.booking.findUnique({where:{id:bookingId},include:{property:true}});if(!booking)return res.sendStatus(404);
 const isOwner=booking.property.ownerId===req.auth.sub;const isAdmin=['admin','moderator'].includes(req.auth.role);if(booking.tenantId!==req.auth.sub&&!isOwner&&!isAdmin)return res.sendStatus(403);
 let status=booking.status;if(action==='approve'&& (isOwner||isAdmin))status='confirmed';else if(action==='reject'&&(isOwner||isAdmin))status='rejected';else if(action==='cancel')status='cancelled';else return res.status(400).json({error:{message:'Unsupported booking action'}});
 const updated=await prisma.$transaction(async tx=>{const b=await tx.booking.update({where:{id:bookingId},data:{status}});if(['cancelled','rejected'].includes(status)&&booking.bedId)await tx.bed.updateMany({where:{id:booking.bedId,status:'reserved'},data:{status:'available'}});return b;});res.json({booking:updated});
 }catch(e){next(e)}});
export default router;
