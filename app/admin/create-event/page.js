import { currentUser } from "@clerk/nextjs/server";
import { CreateEventForm } from "./create-event-form";
import { redirect } from "next/navigation";

export default async function CreateEventPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  // Get primary email or first available email
  const userEmail = user.primaryEmailAddress?.emailAddress || 
                   user.emailAddresses?.[0]?.emailAddress;

  if (!userEmail) {
    throw new Error("User email not found");
  }

  // Only pass necessary user data to avoid serialization issues
  const userData = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: userEmail
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900">Create New Event</h2>
          <div className="mt-4">
            <CreateEventForm user={userData} />
          </div>
        </div>
      </div>
    </div>
  );
} 