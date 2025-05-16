'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function VerificationForm() {
  const [certificateId, setCertificateId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!certificateId) return;

    setIsLoading(true);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateId: certificateId.trim() }),
      });

      const result = await res.json();

      if (res.ok && result.valid) {
        toast.success('✅ Valid Certificate', {
          description: `👤 ${result.participant.name} · 📛 ${result.event?.event_name || 'N/A'} · 📅 ${new Date(result.event?.date).toLocaleDateString()}`,
        });


      } else {
        toast.error('❌ Invalid Certificate', {
          description: result.message || 'Certificate not found or revoked.',
        });
      }
    } catch (err) {
      toast.error('Server error. Please try again later.');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div>
        <label htmlFor="certificate-id" className="sr-only">
          Certificate ID
        </label>
        <input
          id="certificate-id"
          type="text"
          value={certificateId}
          onChange={(e) => setCertificateId(e.target.value)}
          placeholder="Enter Certificate ID"
          required
          className="w-full px-3 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition"
      >
        {isLoading ? 'Verifying...' : 'Verify Certificate'}
      </button>
    </form>
  );
}
