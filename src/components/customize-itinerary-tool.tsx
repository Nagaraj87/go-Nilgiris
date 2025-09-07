"use client";

import { useActionState } from "react";
import { customizeItineraryAction } from "@/app/actions";
import { CustomizeItineraryForm } from "./customize-itinerary-form";
import { CustomizeItineraryResult } from "./customize-itinerary-result";
import { Wand2 } from "lucide-react";

type CustomizeItineraryToolProps = {
  currentItinerary: string;
};

const initialState = {
  customizedItinerary: null,
  error: null,
};

export function CustomizeItineraryTool({ currentItinerary }: CustomizeItineraryToolProps) {
  const [state, formAction] = useActionState(customizeItineraryAction, initialState);

  return (
    <div className="mt-8">
        <div className="flex items-center gap-2 font-headline text-lg text-primary">
          <Wand2 />
          <h2>Dynamic Itinerary Tool</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Tell us your preferences, and our AI will customize the itinerary for you!
        </p>

        <CustomizeItineraryForm 
          currentItinerary={currentItinerary} 
          formAction={formAction} 
        />
        
        <CustomizeItineraryResult state={state} />
    </div>
  );
}
