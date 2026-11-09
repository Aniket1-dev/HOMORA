import { base44 } from '@/api/base44Client';
export async function loginWithMfa(email,password){return base44.auth.login({email,password});}
export async function continueMfa(){throw new Error('Multi-factor authentication is planned for a later HOMORA security release.');}
