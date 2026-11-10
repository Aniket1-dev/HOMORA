import { supabase } from '@/lib/supabase/client';
import { toRecord } from '@/services/entities';

// Every booking state change runs in the database (manage_booking RPC): one transaction, row locks, server-side pricing.
export async function manageBooking(payload) {
  const { data, error } = await supabase.rpc('manage_booking', { payload });
  if (error) return { data: { error: error.message } };
  return { data };
}

// Bookings, visits and enquiries this visitor submitted (by saved id) plus anything tied to their account.
export async function getMyRequests({ bookings = [], visits = [], enquiries = [] } = {}) {
  const { data, error } = await supabase.rpc('get_my_requests', {
    booking_ids: bookings, visit_ids: visits, enquiry_ids: enquiries,
  });
  if (error) throw error;
  const map = (rows) => (rows || []).map(toRecord);
  return { bookings: map(data.bookings), visits: map(data.visits), enquiries: map(data.enquiries) };
}

export async function cancelVisit(id) {
  const { error } = await supabase.rpc('cancel_visit', { visit_id: id });
  if (error) throw error;
}

export function incrementPropertyViews(id) {
  return supabase.rpc('increment_property_views', { pid: id });
}

export async function getRoommateContactEmails() {
  const { data, error } = await supabase.rpc('roommate_contact_emails');
  if (error) throw error;
  return Object.fromEntries((data || []).map((row) => [row.profile_id, row.contact_email]));
}
