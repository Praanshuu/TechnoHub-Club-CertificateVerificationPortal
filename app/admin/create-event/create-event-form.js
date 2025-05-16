"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createEvent } from "@/utils/supabase/events";
import { toast } from "sonner";

const formSchema = z.object({
  eventName: z.string().min(2, {
    message: "Event name must be at least 2 characters.",
  }),
  eventCode: z.string().min(2, {
    message: "Event code must be at least 2 characters.",
  }),
  date: z.string().min(1, {
    message: "Please select a date.",
  }),
  googleSheetUrl: z.string().url().optional().or(z.literal("")),
});

export function CreateEventForm({ user }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventName: "",
      eventCode: "",
      date: "",
      googleSheetUrl: "",
    },
  });

  async function onSubmit(values) {
    try {
      setIsLoading(true);
      console.log("Creating event with values:", values); // Debug log
      console.log("User object:", user); // Debug log to see user structure

      // Get the user's email - handle different possible structures
      let userEmail = user.email || // Try direct email property
                     (user.emailAddresses && user.emailAddresses[0]?.emailAddress) || // Try emailAddresses array
                     user.primaryEmailAddress?.emailAddress || // Try primaryEmailAddress
                     'unknown@email.com'; // Fallback

      const { data, error } = await createEvent({
        eventName: values.eventName,
        eventCode: values.eventCode,
        date: values.date,
        googleSheetUrl: values.googleSheetUrl,
        createdBy: userEmail,
      });

      if (error) {
        console.error("Error from Supabase:", error); // Debug log
        toast.error("Failed to create event: " + error.message);
        return;
      }

      console.log("Event created successfully:", data); // Debug log
      toast.success("Event created successfully!");
      router.push("/admin/events");
      router.refresh();
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <FormField
          control={form.control}
          name="eventName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter event name" className="w-full" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="eventCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Code</FormLabel>
              <FormControl>
                <Input placeholder="Enter event code" className="w-full" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Date</FormLabel>
              <FormControl>
                <Input type="date" className="w-full" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="googleSheetUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Google Sheet URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter Google Sheet URL" className="w-full" {...field} />
              </FormControl>
              <FormDescription>
                Optional: Add a Google Sheet URL for event data
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Event"}
        </Button>
      </form>
    </Form>
  );
} 