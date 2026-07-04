"use client";

import { useState, useEffect } from "react";
import { getEmergencyConfig, updateEmergencyConfig } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Save } from "lucide-react";
import type { EmergencyConfig } from "@/types";

export function EmergencyManagement() {
  const [config, setConfig] = useState<EmergencyConfig>({ isActive: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const data = await getEmergencyConfig();
      setConfig(data);
    } catch (error) {
      console.error("Failed to fetch emergency config", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage("");
    try {
      await updateEmergencyConfig(config);
      setSaveMessage("Emergency configuration saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save emergency config", error);
      setSaveMessage("Failed to save configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 border rounded-lg animate-pulse bg-muted h-48"></div>;
  }

  return (
    <div className="border border-destructive/50 rounded-lg p-6 bg-destructive/5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-6 w-6 text-destructive" />
        <h2 className="text-2xl font-bold text-destructive">Emergency Alert System</h2>
      </div>
      <p className="text-muted-foreground mb-6">
        Use this to display a critical, highly visible warning on the home page during emergencies (e.g., landslides, collector orders).
      </p>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex items-center gap-3 bg-background p-4 rounded-md border">
          <input
            type="checkbox"
            id="isActive"
            className="h-5 w-5 rounded border-gray-300 text-destructive focus:ring-destructive cursor-pointer"
            checked={config.isActive}
            onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
          />
          <label htmlFor="isActive" className="text-sm font-semibold cursor-pointer">
            Enable Emergency Alert on Home Page
          </label>
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium">Alert Message</label>
          <textarea
            id="message"
            required
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={config.message}
            onChange={(e) => setConfig({ ...config, message: e.target.value })}
            placeholder="e.g. Notice: Due to heavy rains, all tourist spots are closed for the next two days by order of the District Collector."
          />
        </div>

        <div className="flex flex-col items-start gap-3">
          <Button type="submit" disabled={isSaving} variant="destructive">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Emergency Config"}
          </Button>
          {saveMessage && (
            <span className={saveMessage.includes("Failed") ? "text-sm text-destructive" : "text-sm text-green-600 font-medium"}>
              {saveMessage}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
