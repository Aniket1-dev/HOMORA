import { supabase } from '@/lib/supabase/client';

// Supabase Auth wrapper: password sign-in, email-OTP sign-up, Google OAuth, password reset, TOTP two-step verification.

const redirectUrl = (path = '/') => new URL(path, window.location.origin).href;

export async function signInWithPassword(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totp = factors?.totp?.[0];
    if (totp) return { mfa_required: true, factorId: totp.id };
  }
  return { mfa_required: false };
}

export async function verifyTotpChallenge(factorId, code) {
  const { data: challenge, error } = await supabase.auth.mfa.challenge({ factorId });
  if (error) throw error;
  const { error: verifyError } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
  if (verifyError) throw verifyError;
}

export async function signUp(email, password, fullName = '') {
  const metadata = fullName.trim() ? { full_name: fullName.trim() } : {};
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: redirectUrl('/'),
    },
  });
  if (error) throw error;
}

export async function verifySignUpCode(email, token) {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
  if (error) throw error;
}

export async function resendSignUpCode(email) {
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) throw error;
}

export async function signInWithGoogle(returnTo = '/') {
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectUrl(returnTo) } });
  if (error) throw error;
}

export async function requestPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl('/reset-password') });
  if (error) throw error;
}

export async function setNewPassword(password) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

const PROFILE_FIELDS = ['display_name', 'phone', 'city', 'organisation', 'occupation'];

export async function updateMyProfile(fields) {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user?.id;
  if (!id) throw new Error('Please sign in.');
  const patch = Object.fromEntries(PROFILE_FIELDS.filter((key) => key in fields).map((key) => [key, fields[key]]));
  const { error } = await supabase.from('profiles').update(patch).eq('id', id);
  if (error) throw error;
}

export async function loadCurrentUser() {
  const { data } = await supabase.auth.getSession();
  const authUser = data.session?.user;
  if (!authUser) return null;
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', authUser.id),
  ]);
  const roleNames = (roles || []).map((row) => row.role);
  return {
    id: authUser.id,
    email: authUser.email,
    full_name: profile?.full_name || authUser.user_metadata?.full_name || '',
    display_name: profile?.display_name || '',
    phone: profile?.phone || '',
    city: profile?.city || '',
    organisation: profile?.organisation || '',
    occupation: profile?.occupation || '',
    role: roleNames.includes('admin') ? 'admin' : roleNames.includes('moderator') ? 'moderator' : 'user',
  };
}

// ---- Two-step verification (authenticator app / TOTP) ----
export async function listTotpFactors() {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) throw error;
  return data?.totp || [];
}

export async function enrollTotp() {
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
  if (error) throw error;
  return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
}

export const confirmTotpEnrollment = verifyTotpChallenge;

export async function removeTotpFactor(factorId) {
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) throw error;
}
