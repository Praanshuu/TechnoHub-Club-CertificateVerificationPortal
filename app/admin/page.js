import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { checkRole } from '@/utils/checkRole';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  // Check if user is admin
  const isAdmin = await checkRole('admin');
  if (!isAdmin) redirect('/');

  // Fetch user info for display
  const user = await currentUser();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900">Welcome to Admin Dashboard</h2>
          <div className="mt-4 text-sm text-gray-500">
            <p>Welcome, {user?.firstName || 'Admin'}</p>
            <p>Your admin ID: {user?.id}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/admin/create-event"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create New Event
            </Link>
            <Link
              href="/admin/events"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              View All Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
