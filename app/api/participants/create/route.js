import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";
import { generateCertificateId } from '@/utils/generateCertificateId';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { eventId, name, email } = body;

    if (!eventId || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('event_code, date')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const { data: existingParticipant } = await supabase
      .from('participants')
      .select('revoked, certificate_id, created_at')
      .eq('event_id', eventId)
      .eq('email', email.toLowerCase())
      .eq('name', name.trim())
      .single();

    const clubCode = 'TH';

    const newParticipant = {
      name: name.trim(),
      email: email.toLowerCase(),
      event_id: eventId,
      certificate_id: existingParticipant?.certificate_id || generateCertificateId(clubCode, event.event_code, event.date),
      revoked: existingParticipant?.revoked ?? false,
      created_at: existingParticipant?.created_at || new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('participants')
      .upsert([newParticipant], {
        onConflict: ['event_id', 'email', 'name'],
      });

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
