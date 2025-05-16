'use client';

import { createTestEvents } from "@/utils/supabase/test-events";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function TestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, { time: new Date().toISOString(), message }]);
  };

  const handleCreateTestEvents = async () => {
    setIsLoading(true);
    addLog("Starting to create test events...");
    
    try {
      await createTestEvents();
      addLog("Successfully created test events");
    } catch (error) {
      addLog(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Test Page</h1>
      </div>

      <div className="space-y-4">
        <div>
          <Button 
            onClick={handleCreateTestEvents}
            disabled={isLoading}
          >
            {isLoading ? "Creating Test Events..." : "Create Test Events"}
          </Button>
        </div>

        {/* Logs Display */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Logs</h2>
          <div className="bg-gray-100 p-4 rounded-lg space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="font-mono text-sm">
                <span className="text-gray-500">{new Date(log.time).toLocaleTimeString()}</span>
                {" "}
                <span>{log.message}</span>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-gray-500 italic">No logs yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 