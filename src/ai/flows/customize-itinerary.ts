'use server';

/**
 * @fileOverview A dynamic itinerary customization AI agent.
 *
 * - customizeItinerary - A function that handles the itinerary customization process.
 * - CustomizeItineraryInput - The input type for the customizeItinerary function.
 * - CustomizeItineraryOutput - The return type for the customizeItinerary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomizeItineraryInputSchema = z.object({
  preferences: z
    .string()
    .describe('The user preferences for the tour itinerary.'),
  currentItinerary: z.string().describe('The current itinerary of the tour.'),
});
export type CustomizeItineraryInput = z.infer<typeof CustomizeItineraryInputSchema>;

const CustomizeItineraryOutputSchema = z.object({
  customizedItinerary: z
    .string()
    .describe('The customized itinerary based on user preferences, including optimal routes and timings for visiting places.'),
});
export type CustomizeItineraryOutput = z.infer<typeof CustomizeItineraryOutputSchema>;

export async function customizeItinerary(input: CustomizeItineraryInput): Promise<CustomizeItineraryOutput> {
  return customizeItineraryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customizeItineraryPrompt',
  input: {schema: CustomizeItineraryInputSchema},
  output: {schema: CustomizeItineraryOutputSchema},
  prompt: `You are an expert tour guide specializing in creating personalized tour itineraries, optimizing routes and timings.

You will use the user preferences and current itinerary to create a customized itinerary that caters to the user's needs and interests.

User Preferences: {{{preferences}}}
Current Itinerary: {{{currentItinerary}}}

Customized Itinerary:`,
});

const customizeItineraryFlow = ai.defineFlow(
  {
    name: 'customizeItineraryFlow',
    inputSchema: CustomizeItineraryInputSchema,
    outputSchema: CustomizeItineraryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
