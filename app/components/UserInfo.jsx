'use client';

import { useUser } from '@clerk/nextjs';

export default function UserInfo() {
  const { user, isSignedIn } = useUser();

  if (!isSignedIn) return null;

  return <p>Logged in as {user.primaryEmailAddress.emailAddress}</p>;
}
