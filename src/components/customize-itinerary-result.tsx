"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wand2, ServerCrash } from "lucide-react";

type State = {
    customizedItinerary?: string | null;
    error?: string | null;
}

type CustomizeItineraryResultProps = {
    state: State;
}

export function CustomizeItineraryResult({ state }: CustomizeItineraryResultProps) {
    if (state.error) {
        return (
            <div className="mt-4">
                <Alert variant="destructive">
                    <ServerCrash className="h-4 w-4" />
                    <AlertTitle>Customization Failed</AlertTitle>
                    <AlertDescription>{state.error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (state.customizedItinerary) {
        return (
            <div className="mt-4">
                 <Alert variant="default" className="bg-primary/5 border-primary/20">
                    <Wand2 className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-primary">Your Customized Itinerary</AlertTitle>
                    <AlertDescription className="whitespace-pre-wrap text-foreground">
                        {state.customizedItinerary}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return null;
}
