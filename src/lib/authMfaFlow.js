import { base44 } from '@/api/base44Client';
export class MfaError extends Error { constructor(message,status){super(message);this.status=status;} get mustSignInAgain(){return this.status===401;} }
export function mfaSession(){throw new Error('MFA is not enabled in this HOMORA backend release.');}
export async function signInToManageMfa(email,password){return base44.auth.login({email,password});}
export async function resumeMfa(){return null;}
export async function loadSignInOptions(){return {auth_config:{mfa_policy:'optional',providers:[]}};}
export async function signInWithProvider(provider){return base44.auth.loginWithProvider(provider);}
export function finishSignIn(_token,returnTo){window.location.href=returnTo||'/';}
