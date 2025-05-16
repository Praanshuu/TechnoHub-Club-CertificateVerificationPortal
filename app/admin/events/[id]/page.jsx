import { getEventById } from "@/utils/supabase/events";
import { getParticipantsByEventId } from "@/utils/supabase/participants";
import { notFound } from "next/navigation";
import EventDetailsClient from "./EventDetailsClient";

export default async function EventDetailsPage({ params }) {
  const eventId = params.id;

  const { data: event, error: eventError } = await getEventById(eventId);
  if (eventError || !event) return notFound();

  const { data: participants, error: participantsError } = await getParticipantsByEventId(eventId);

  return (
    <EventDetailsClient event={event} participants={participants || []} participantsError={participantsError} />
  );
}
