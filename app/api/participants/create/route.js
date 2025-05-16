import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

import { generateCertificateId } from '@/utils/generateCertificateId';

export async function POST(req) {
  try {
    const body = await req.json();
    const { eventId, name, email } = body;

    // 1. Get event info (event_code and date)
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('event_code, date')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const clubCode = 'TH'; // hardcoded for now; you can make dynamic later
    const certId = generateCertificateId(clubCode, event.event_code, event.date);

    // 2. Insert participant with generated cert ID
    const { data, error } = await supabase.from('participants').insert([
      {
        name,
        email,
        certificate_id: certId,
        event_id: eventId,
        revoked: false,
      },
    ]);

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to add participant' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Participant created', data }, { status: 200 });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

