'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function AdminLink() {
  const { user, isSignedIn } = useUser();

  if (!isSignedIn || user?.publicMetadata?.role !== 'admin') return null;

  return (
    <Link href="/admin" className="text-gray-900 hover:text-gray-600">
      Admin Dashboard
    </Link>
  );
}
