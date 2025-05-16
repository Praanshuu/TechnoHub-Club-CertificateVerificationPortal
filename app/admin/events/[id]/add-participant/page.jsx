'use client';

import { useState, use } from 'react'; // ✅ Import `use`
import { useRouter } from 'next/navigation';

export default function AddParticipantPage({ params }) {
  const router = useRouter();
  const { id: eventId } = use(params); // ✅ Use React.use() to unwrap the params

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/participants/create', {
      method: 'POST',
      body: JSON.stringify({ eventId, name, email }),
    });

    const result = await res.json();
    setLoading(false);

    if (res.ok) {
      alert('Participant added successfully');
      router.push(`/admin/events/${eventId}`);
    } else {
      alert('Failed: ' + result.error);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Add Participant</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {loading ? 'Submitting...' : 'Create Certificate'}
        </button>
      </form>
    </div>
  );
}
