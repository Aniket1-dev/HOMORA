import { supabase } from '@/lib/supabase/client';

const extOf = (file) => (file.name?.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');

async function currentUserId() {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user?.id;
  if (!id) throw new Error('Please sign in to upload files.');
  return id;
}

// Public listing photo -> returns a public URL.
export async function uploadListingImage(file) {
  const path = `${await currentUserId()}/${crypto.randomUUID()}.${extOf(file)}`;
  const { error } = await supabase.storage.from('listing-media').upload(path, file, { contentType: file.type });
  if (error) throw error;
  return supabase.storage.from('listing-media').getPublicUrl(path).data.publicUrl;
}

// Private KYC document -> returns the storage PATH (never a public URL). Use signedDocumentUrl() to view.
export async function uploadVerificationDocument(file) {
  const path = `${await currentUserId()}/${crypto.randomUUID()}.${extOf(file)}`;
  const { error } = await supabase.storage.from('verification-docs').upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

export async function signedDocumentUrl(path, seconds = 120) {
  const { data, error } = await supabase.storage.from('verification-docs').createSignedUrl(path, seconds);
  if (error) throw error;
  return data.signedUrl;
}
