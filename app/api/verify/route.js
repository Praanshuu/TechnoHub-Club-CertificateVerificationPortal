import { createClient } from '@supabase/supabase-js';

import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req) {
  try {
    const body = await req.json();
    const { certificateId } = body;

    if (!certificateId || certificateId.length < 10) {
      return NextResponse.json({ error: 'Invalid certificate ID.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('participants')
      .select('name, email, certificate_id, revoked, created_at, event_id')
      .eq('certificate_id', certificateId)
      .single();

    if (error || !data) {
      return NextResponse.json({ valid: false, message: 'Certificate not found.' }, { status: 404 });
    }

    if (data.revoked) {
      return NextResponse.json({ valid: false, message: 'Certificate has been revoked.' }, { status: 403 });
    }

    // Optionally fetch event details
    const eventRes = await supabase
      .from('events')
      .select('event_name, date')
      .eq('id', data.event_id)
      .single();

    return NextResponse.json({
      valid: true,
      participant: {
        name: data.name,
        email: data.email,
        certificateId: data.certificate_id,
        createdAt: data.created_at,
      },
      event: eventRes.data || null,
    });
  } catch (err) {
    console.error('Verification error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
