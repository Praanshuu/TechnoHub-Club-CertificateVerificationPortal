import supabase from './events';

// Test data
const testEvents = [
  {
    eventName: "Workshop 2024",
    eventCode: "WS001",
    date: "2024-03-15",
    googleSheetUrl: "",
    createdBy: "test.admin@technohub.com"
  },
  {
    eventName: "Hackathon 2024",
    eventCode: "HACK001",
    date: "2024-04-01",
    googleSheetUrl: "",
    createdBy: "test.admin@technohub.com"
  },
  {
    eventName: "Tech Talk",
    eventCode: "TT001",
    date: "2024-03-30",
    googleSheetUrl: "",
    createdBy: "test.admin@technohub.com"
  }
];

// Function to create test events
export async function createTestEvents() {
  console.log("Starting to create test events...");
  
  for (const event of testEvents) {
    try {
      console.log(`Creating event: ${event.eventName}`);
      
      const { data, error } = await supabase
        .from('events')
        .insert([{
          event_name: event.eventName,
          event_code: event.eventCode,
          date: event.date,
          google_sheet_url: event.googleSheetUrl,
          created_by: event.createdBy,
          created_at: new Date().toISOString()
        }])
        .select();
      
      if (error) {
        console.error('Error creating event:', error);
      } else {
        console.log('Created event successfully:', data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  console.log("Finished creating test events");
} 