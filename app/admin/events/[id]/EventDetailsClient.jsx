'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';

export default function EventDetailsClient({ event, participants: initialParticipants, participantsError }) {
  const [participants, setParticipants] = useState(initialParticipants || []);

  const router = useRouter();

  async function handleDelete() {
    const confirmed = confirm("Are you sure you want to delete this event?");
    if (!confirmed) return;

    const res = await fetch(`/api/events/delete/${event.id}`, { method: 'DELETE' });

    if (res.ok) {
      alert("Event deleted");
      router.push('/admin/events');
    } else {
      alert("Failed to delete event");
    }
  }

  // ✅ Revoke toggle per participant
  function ParticipantRow({ participant }) {
    const [isRevoked, setIsRevoked] = useState(participant.revoked);

    async function toggleRevoke(e) {
      const isNowActive = e.target.checked;
      const revokeStatus = !isNowActive;

      try {
        const res = await fetch('/api/participants/revoke', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            certificateId: participant.certificate_id,
            revoke: revokeStatus,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          setIsRevoked(revokeStatus);
          toast.success(data.message);
        } else {
          toast.error(data.error || 'Failed to update revoke status');
        }
      } catch {
        toast.error('Server error during revoke');
      }
    }

    return (
      <tr key={participant.id} className="border-b">
        <td className="px-4 py-2">{participant.name}</td>
        <td className="px-4 py-2">{participant.email}</td>
        <td className="px-4 py-2">{participant.certificate_id}</td>
        <td className="px-4 py-2">{new Date(participant.created_at).toLocaleDateString()}</td>
        <td className="px-4 py-2 flex items-center space-x-2">
          <input
            type="checkbox"
            id={`revoke-checkbox-${participant.id}`}
            checked={!isRevoked}
            onChange={toggleRevoke}
            className="cursor-pointer"
          />
          <label
            htmlFor={`revoke-checkbox-${participant.id}`}
            className={`font-semibold select-none ${isRevoked ? 'text-red-600' : 'text-green-600'}`}
          >
            {isRevoked ? 'Revoked' : 'Active'}
          </label>
        </td>
      </tr>
    );
  }
  async function handleImport() {
    if (!event.id || !event.google_sheet_url) {
      toast.error('Missing event ID or Google Sheet URL');
      return;
    }

    try {
      const res = await fetch('/api/participants/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          googleSheetUrl: event.google_sheet_url,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Import failed');
      }

      toast.success(`✅ Successfully imported ${data?.count ?? 0} participants.`);

      const refreshed = await fetch(`/api/participants/event/${event.id}`);
      const updated = await refreshed.json();
      console.log("Updated participants list:", updated.participants); // <-- check this
      setParticipants(updated.participants || []);

    } catch (error) {
      toast.error(error.message);
    }
  }

  function handleExport() {
    if (!event || !participants?.length) {
      toast.error("Nothing to export");
      return;
    }

    const headers = ['Name', 'Email', 'Certificate ID', 'Created At', 'Status'];
    const rows = participants.map((p) => [
      `"${p.name}"`,
      `"${p.email}"`,
      `"${p.certificate_id}"`,
      `"${new Date(p.created_at).toLocaleString()}"`,
      `"${p.revoked ? 'Revoked' : 'Active'}"`
    ]);

    // Add event metadata at the top
    const eventDetails = [
      ['Event Name', `"${event.event_name}"`],
      ['Event Code', `"${event.event_code}"`],
      ['Date', `"${event.date}"`],
      [],
      headers,
      ...rows
    ];

    const csvContent = eventDetails.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = `${event.event_code}_participants_export.csv`;

    saveAs(blob, filename);
  }
  return (
    <div className="space-y-8">
      {/* Event Info */}
      <section className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800">Event Details</h1>
        <div className="mt-4 space-y-2 text-gray-600">
          <p><strong>Name:</strong> {event.event_name}</p>
          <p><strong>Code:</strong> {event.event_code}</p>
          <p><strong>Date:</strong> {event.date}</p>
          {event.google_sheet_url && (
            <p>
              <strong>Sheet:</strong>{' '}
              <a
                href={event.google_sheet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Google Sheet
              </a>
            </p>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href={`/admin/events/${event.id}/edit`}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm"
          >
            ✏️ Edit Event
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
          >
            🗑️ Delete Event
          </button>
        </div>
      </section>

      {/* Participants Section */}
      <section className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Participants{' '}
            <span className="text-gray-500 text-base font-normal">
              ({participants?.length ?? 0})
            </span>
          </h2>

          <div className="flex gap-2">
            <Link
              href={`/admin/events/${event.id}/add-participant`}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
            >
              + Add Participant
            </Link>
            <button
              onClick={handleImport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
              disabled={!event.google_sheet_url}
              title={!event.google_sheet_url ? 'No Google Sheet URL set' : ''}
            >
              🔄 Sync from Google Sheet
            </button>
            <button
              onClick={handleExport}
              className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm"
            >
              ⬇️ Export Data
            </button>

          </div>
        </div>

        {participantsError && <p className="text-red-600">Failed to load participants.</p>}

        {!participants?.length ? (
          <p className="text-gray-500">No participants added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-xs uppercase">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Certificate ID</th>
                  <th className="px-4 py-2">Created At</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <ParticipantRow key={p.id} participant={p} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
