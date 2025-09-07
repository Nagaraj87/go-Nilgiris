"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Loader2 } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
      Customize
    </Button>
  );
}

type CustomizeItineraryFormProps = {
    currentItinerary: string;
    formAction: (payload: FormData) => void;
}

export function CustomizeItineraryForm({ currentItinerary, formAction }: CustomizeItineraryFormProps) {
    const [preferences, setPreferences] = useState("");

    return (
        <form action={formAction} className="mt-4">
            <input type="hidden" name="currentItinerary" value={currentItinerary} />
            <Textarea
                name="preferences"
                placeholder="e.g., 'I love photography, so I'd like to spend more time at viewpoints. I'm not interested in shopping.'"
                className="min-h-[100px] bg-background"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                required
            />
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-xs text-muted-foreground">Powered by Google AI</p>
                <SubmitButton />
            </div>
      </form>
    )
}
