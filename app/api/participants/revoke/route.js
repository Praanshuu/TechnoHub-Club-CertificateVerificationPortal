import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req) {
  try {
    const { certificateId, revoke } = await req.json();

    if (!certificateId || typeof revoke !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { error } = await supabase
      .from('participants')
      .update({ revoked: revoke })
      .eq('certificate_id', certificateId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: `Certificate ${revoke ? 'revoked' : 'unrevoked'}` });
  } catch (err) {
    console.error('Revoke API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
