import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Create a new event
export async function createEvent({ eventName, eventCode, date, googleSheetUrl, createdBy }) {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([
        {
          event_name: eventName,
          event_code: eventCode,
          date,
          google_sheet_url: googleSheetUrl,
          created_by: createdBy,
          created_at: new Date().toISOString(),
        }
      ])
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating event:', error);
    return { data: null, error };
  }
}

// Get all events with optional pagination
export async function getAllEvents(page = 0, pageSize = 10) {
  try {
    const start = page * pageSize;
    const end = start + pageSize - 1;

    const { data, error, count } = await supabase
      .from('events')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) throw error;
    return { data, error: null, count };
  } catch (error) {
    console.error('Error fetching events:', error);
    return { data: null, error, count: 0 };
  }
}

// Get a single event by ID
export async function getEventById(id) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching event:', error);
    return { data: null, error };
  }
}

// Get event by code
export async function getEventByCode(eventCode) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('event_code', eventCode)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching event:', error);
    return { data: null, error };
  }
}

// Update an event
export async function updateEvent(id, updates) {
  try {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating event:', error);
    return { data: null, error };
  }
}

// Delete an event
export async function deleteEvent(id) {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { error };
  }
}

// Search events
export async function searchEvents(query) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .or(`event_name.ilike.%${query}%,event_code.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error searching events:', error);
    return { data: null, error };
  }
}

export default supabase;
