import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  try {
    const eventId = params.id;
    const body = await req.json();

    const { event_name, event_code, date, google_sheet_url } = body;

    if (!event_name || !event_code || !date) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('events')
      .update({
        event_name,
        event_code,
        date,
        google_sheet_url,
      })
      .eq('id', eventId);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Event updated', data }, { status: 200 });
  } catch (err) {
    console.error('Update event error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
