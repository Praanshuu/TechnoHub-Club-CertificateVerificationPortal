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

    // 1. Fetch event details (event_code, date, google_sheet_url)
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('event_code, date, google_sheet_url')
      .eq('id', eventId)
      .single();

    if (eventError) {
      console.error('Error fetching event:', eventError);
      return NextResponse.json({ error: 'Failed to fetch event details' }, { status: 500 });
    }

    if (!event || !event.google_sheet_url) {
      return NextResponse.json({ error: 'Event not found or missing Google Sheet URL' }, { status: 404 });
    }

    // 2. Fetch data from Google Sheet Apps Script URL
    const res = await fetch(event.google_sheet_url);

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch data from Google Sheet' }, { status: 502 });
    }

    const rawData = await res.json();

    if (!Array.isArray(rawData) || rawData.length === 0) {
      return NextResponse.json({ error: 'No participant data found in the sheet' }, { status: 400 });
    }

    // 3. Prepare data for bulk insertion
    const clubCode = 'TH'; // Replace or parametrize as needed

    const rows = rawData.map((p) => {
      // Basic validations and normalization
      const name = p['Name']?.trim();
      const email = p['Email']?.toLowerCase().trim();

      if (!name || !email) {
        // Skip incomplete records
        return null;
      }

      return {
        name,
        email,
        certificate_id: generateCertificateId(clubCode, event.event_code, event.date),
        event_id: eventId,
        revoked: false,
        created_at: new Date().toISOString(),
      };
    }).filter(Boolean); // Remove null entries

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No valid participant records to insert' }, { status: 400 });
    }

    // 4. Bulk insert into Supabase participants table
    const { error: insertError } = await supabase.from('participants').insert(rows);

    if (insertError) {
      console.error('Bulk insert error:', insertError);
      return NextResponse.json({ error: 'Failed to insert participants' }, { status: 500 });
    }

    return NextResponse.json({ message: `✅ Imported ${rows.length} participants successfully` });
  } catch (err) {
    console.error('Import API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
