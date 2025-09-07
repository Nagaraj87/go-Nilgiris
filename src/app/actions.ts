'use server';

import { z } from 'zod';
import { customizeItinerary } from '@/ai/flows/customize-itinerary';

const CustomizeItinerarySchema = z.object({
  preferences: z.string().min(10, "Please provide more details about your preferences."),
  currentItinerary: z.string(),
});

type State = {
  customizedItinerary?: string | null;
  error?: string | null;
}

export async function customizeItineraryAction(prevState: State, formData: FormData): Promise<State> {
  try {
    const validatedFields = CustomizeItinerarySchema.safeParse({
      preferences: formData.get('preferences'),
      currentItinerary: formData.get('currentItinerary'),
    });

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.flatten().fieldErrors.preferences?.[0] || "Invalid input.",
      };
    }

    const result = await customizeItinerary(validatedFields.data);
    
    if (!result.customizedItinerary) {
      return { error: 'Could not generate a custom itinerary. Please try again.' };
    }

    return { customizedItinerary: result.customizedItinerary };
  } catch (error) {
    console.error(error);
    return { error: 'An unexpected error occurred. Please try again later.' };
  }
}
