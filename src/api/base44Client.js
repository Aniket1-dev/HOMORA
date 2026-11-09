import { appParams } from '@/lib/app-params';
const API=(import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'');
const tokenKey='homora_access_token';
const token=()=>typeof window!=='undefined'?localStorage.getItem(tokenKey):null;
const setToken=(value)=>{if(typeof window!=='undefined'){if(value)localStorage.setItem(tokenKey,value);else localStorage.removeItem(tokenKey);}};
async function request(path,{method='GET',body,auth=true,headers={}}={}){
 const response=await fetch(`${API}${path}`,{method,headers:{...(body!==undefined?{'Content-Type':'application/json'}:{}),...(auth&&token()?{Authorization:`Bearer ${token()}`} :{}),...headers},body:body===undefined?undefined:JSON.stringify(body)});
 const data=await response.json().catch(()=>({}));if(!response.ok){const e=new Error(data.error?.message||data.message||`Request failed (${response.status})`);e.status=response.status;e.data=data;throw e;}return data;
}
const entity=(name)=>({
 list:async(options={})=>{const rows=await request(`/api/entities/${name}?${new URLSearchParams({...(options.sort?{sort:options.sort.replace('created_date','createdAt')}:{}),...(options.limit?{limit:String(options.limit)}:{})})}`);return {items:rows};},
 filter:async(filters={},options={})=>{const rows=await request(`/api/entities/${name}?${new URLSearchParams({filter:JSON.stringify(filters),...(options.sort?{sort:options.sort.replace('created_date','createdAt')}:{}),...(options.limit?{limit:String(options.limit)}:{})})}`);return {items:rows};},
 get:(id)=>request(`/api/entities/${name}/${encodeURIComponent(id)}`),
 create:(data)=>request(`/api/entities/${name}`,{method:'POST',body:data}),
 update:(id,data)=>request(`/api/entities/${name}/${encodeURIComponent(id)}`,{method:'PATCH',body:data}),
 delete:(id)=>request(`/api/entities/${name}/${encodeURIComponent(id)}`,{method:'DELETE'}),
 bulkCreate:(rows)=>request(`/api/entities/${name}/bulk`,{method:'POST',body:rows}),
});
const entities=Object.fromEntries(['Property','Room','Bed','Booking','Visit','Enquiry','Review','OwnerVerification','Report','RoommateProfile','RoommateConnection'].map(n=>[n,entity(n)]));
export const base44={
 entities,
 auth:{
  me:()=>request('/api/auth/me'),
  register:({email,password,name})=>request('/api/auth/register',{method:'POST',body:{email,password,name},auth:false}),
  verifyOtp:async({email,otpCode})=>{const r=await request('/api/auth/verify-otp',{method:'POST',body:{email,otpCode},auth:false});if(r.access_token)setToken(r.access_token);return r;},
  resendOtp:(value)=>{const email=typeof value==='string'?value:value?.email;return request('/api/auth/resend-otp',{method:'POST',body:{email},auth:false});},
  login:async({email,password})=>{const r=await request('/api/auth/login',{method:'POST',body:{email,password},auth:false});if(r.access_token)setToken(r.access_token);return r;},
  setToken,
  updateMe:(data)=>request('/api/auth/me',{method:'PATCH',body:data}),
  logout:()=>{setToken(null);if(typeof window!=='undefined')window.location.assign('/login');},
  redirectToLogin:(returnTo='/')=>{if(typeof window!=='undefined')window.location.assign(`/login?returnTo=${encodeURIComponent(returnTo)}`);},
  resetPasswordRequest:(email)=>request('/api/auth/forgot-password',{method:'POST',body:{email},auth:false}),
  resetPassword:({email,resetToken,newPassword})=>request('/api/auth/reset-password',{method:'POST',body:{email,otpCode:resetToken,newPassword},auth:false}),
  loginWithProvider:async()=>{throw new Error('Social sign-in is not configured yet. Configure an OAuth provider in the HOMORA API first.');},
 },
 app:{getPublicSettings:async()=>({id:'homora-discover',public_settings:{product_name:'HOMORA'}})},
 functions:{invoke:async(name,payload)=>{if(name==='manageBooking'){const r=await request('/api/bookings/manage',{method:'POST',body:payload});return {data:r};}throw new Error(`Unknown HOMORA function: ${name}`);}},
 integrations:{Core:{UploadPublicFile:({file})=>upload(file),UploadPrivateFile:({file})=>upload(file)}},
};
async function upload(file){const form=new FormData();form.append('file',file);const response=await fetch(`${API}/api/uploads`,{method:'POST',headers:token()?{Authorization:`Bearer ${token()}`}:{},body:form});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error?.message||'Upload failed');return data;}
export { request as homoraRequest };
