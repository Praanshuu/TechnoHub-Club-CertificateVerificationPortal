import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateCertificateId } from '@/utils/generateCertificateId';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId in request' }, { status: 400 });
    }

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('event_code, date, google_sheet_url')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Failed to fetch event details' }, { status: 500 });
    }

    if (!event.google_sheet_url) {
      return NextResponse.json({ error: 'Missing Google Sheet URL in event' }, { status: 400 });
    }

    const res = await fetch(event.google_sheet_url);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch data from Google Sheet' }, { status: 502 });
    }

    const rawData = await res.json();

    if (!Array.isArray(rawData) || rawData.length === 0) {
      return NextResponse.json({ error: 'No participant data found in the sheet' }, { status: 400 });
    }

    const clubCode = 'TH';

    const participantKeys = rawData.map((p) => ({
      email: p['Email']?.toLowerCase().trim(),
      name: p['Name']?.trim(),
    })).filter(p => p.email && p.name);

    const { data: existingParticipants = [] } = await supabase
      .from('participants')
      .select('email, name, revoked, certificate_id, created_at')
      .in('email', participantKeys.map(p => p.email))
      .eq('event_id', eventId);

    const rows = participantKeys.map(({ name, email }) => {
      const existing = existingParticipants.find(
        (ep) => ep.email === email && ep.name === name
      );

      return {
        name,
        email,
        event_id: eventId,
        certificate_id: existing?.certificate_id || generateCertificateId(clubCode, event.event_code, event.date),
        revoked: existing?.revoked ?? false,
        created_at: existing?.created_at || new Date().toISOString(),
      };
    });

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No valid participant records to insert' }, { status: 400 });
    }

    const { error: upsertError } = await supabase
      .from('participants')
      .upsert(rows, {
        onConflict: ['event_id', 'email', 'name'],
      });

    if (upsertError) {
      console.error('Upsert Error:', upsertError);
      return NextResponse.json({ error: 'Failed to import participants' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Participants imported successfully', count: rows.length });
  } catch (err) {
    console.error('Unhandled Import Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
