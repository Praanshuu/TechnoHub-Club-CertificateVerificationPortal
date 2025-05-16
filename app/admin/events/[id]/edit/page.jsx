'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';

export default function EditEventPage(props) {
  const { id: eventId } = use(props.params);
  const router = useRouter();

  const [eventName, setEventName] = useState('');
  const [eventCode, setEventCode] = useState('');
  const [date, setDate] = useState('');
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current || !eventId) return;

    const fetchEvent = async () => {
  try {
    const res = await fetch(`/api/events/${eventId}`);
    const data = await res.json();

    if (!res.ok || !data?.event_name) {
      console.warn('Event not found or error response:', data);
      return; // silently ignore or toast if needed
    }

    setEventName(data.event_name || '');
    setEventCode(data.event_code || '');
    setDate(data.date ? data.date.split('T')[0] : '');
    setGoogleSheetUrl(data.google_sheet_url || '');
  } catch (err) {
    console.error('Failed to fetch event:', err);
    // Optional: toast.error("Couldn't fetch event")
  } finally {
    setLoading(false);
  }
};


    hasFetched.current = true;
    fetchEvent();
  }, [eventId]);


  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      event_name: eventName,
      event_code: eventCode,
      date,
      google_sheet_url: googleSheetUrl,
    };

    const res = await fetch(`/api/events/update/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert('Event updated successfully');
      router.push(`/admin/events/${eventId}`);
    } else {
      const error = await res.json();
      alert('Failed to update event: ' + (error.message || 'Unknown error'));
    }

    setSubmitting(false);
  }

  if (loading) return <p>Loading event data...</p>;

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="eventName" className="block mb-1 font-medium">Event Name</label>
          <input
            id="eventName"
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label htmlFor="eventCode" className="block mb-1 font-medium">Event Code</label>
          <input
            id="eventCode"
            type="text"
            value={eventCode}
            onChange={(e) => setEventCode(e.target.value.toUpperCase())}
            maxLength={5}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
          <p className="text-sm text-gray-500 mt-1">E.g. HC for Hack Club</p>
        </div>

        <div>
          <label htmlFor="date" className="block mb-1 font-medium">Date</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label htmlFor="googleSheetUrl" className="block mb-1 font-medium">Google Sheet URL (optional)</label>
          <input
            id="googleSheetUrl"
            type="url"
            value={googleSheetUrl}
            onChange={(e) => setGoogleSheetUrl(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="https://docs.google.com/spreadsheets/..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
        >
          {submitting ? 'Updating...' : 'Update Event'}
        </button>
      </form>
    </div>
  );
}
