import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getParticipantsByEventId(eventId) {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function createParticipant(participantData) {
  const { data, error } = await supabase
    .from('participants')
    .insert([participantData]);

  return { data, error };
}