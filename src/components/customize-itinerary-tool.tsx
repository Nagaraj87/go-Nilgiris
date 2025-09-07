"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { customizeItineraryAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wand2, Loader2, ServerCrash } from "lucide-react";

type CustomizeItineraryToolProps = {
  currentItinerary: string;
};

const initialState = {
  customizedItinerary: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
      Customize
    </Button>
  );
}

export function CustomizeItineraryTool({ currentItinerary }: CustomizeItineraryToolProps) {
  const [state, formAction] = useFormState(customizeItineraryAction, initialState);
  const [preferences, setPreferences] = useState("");

  return (
    <Card className="bg-background/70 mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-primary">
          <Wand2 />
          Dynamic Itinerary Tool
        </CardTitle>
        <CardDescription>
          Tell us your preferences, and our AI will customize the itinerary for you!
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <input type="hidden" name="currentItinerary" value={currentItinerary} />
        <CardContent>
          <Textarea
            name="preferences"
            placeholder="e.g., 'I love photography, so I'd like to spend more time at viewpoints. I'm not interested in shopping.'"
            className="min-h-[100px]"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            required
          />
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-xs text-muted-foreground">Powered by Google AI</p>
          <SubmitButton />
        </CardFooter>
      </form>

      {state.error && (
        <div className="px-6 pb-6">
            <Alert variant="destructive">
                <ServerCrash className="h-4 w-4" />
                <AlertTitle>Customization Failed</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
        </div>
      )}

      {state.customizedItinerary && (
        <div className="px-6 pb-6">
             <Alert variant="default" className="bg-primary/5 border-primary/20">
                <Wand2 className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary">Your Customized Itinerary</AlertTitle>
                <AlertDescription className="whitespace-pre-wrap text-foreground">
                    {state.customizedItinerary}
                </AlertDescription>
            </Alert>
        </div>
      )}
    </Card>
  );
}
