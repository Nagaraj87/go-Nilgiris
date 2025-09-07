
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Users, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { tourPackages } from '@/lib/data';
import { createDummyBooking } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const dummyBookingSchema = z.object({
    packageSlug: z.string({ required_error: "Please select a tour package." }),
    bookingDate: z.date({ required_error: "A booking date is required." }),
    memberCount: z.coerce.number().min(1, 'At least one member is required').max(20, "You can add a maximum of 20 dummy members at a time."),
});

type DummyBookingFormValues = z.infer<typeof dummyBookingSchema>;


export default function DummyBookingPage() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<DummyBookingFormValues>({
        resolver: zodResolver(dummyBookingSchema),
        defaultValues: {
            packageSlug: undefined,
            bookingDate: new Date(),
            memberCount: 5,
        },
    });

    const onSubmit = async (data: DummyBookingFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await createDummyBooking(data);
            if (result.error) {
                toast({ variant: 'destructive', title: "Error creating bookings", description: result.error });
            } else {
                toast({ title: 'Dummy Bookings Created!', description: `Successfully created ${result.successCount} dummy bookings.` });
                form.reset();
            }
        } catch (error) {
            console.error("Failed to create dummy bookings:", error);
            toast({
                variant: "destructive",
                title: "Operation Failed",
                description: "Could not create dummy bookings. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const disabledDates = (date: Date) => {
        const isPast = date < new Date(new Date().setDate(new Date().getDate() - 1));
        return isPast;
    }

    return (
        <div className="container mx-auto max-w-2xl py-12">
            <div className="flex items-center gap-2 mb-4">
                <Users className="text-primary h-8 w-8"/>
                <h1 className="text-3xl font-bold">Dummy Booking Generator</h1>
            </div>
            <p className="text-muted-foreground mb-8">Create fake bookings to increase the perceived popularity of your tours.</p>
            <Card>
                <CardHeader>
                    <CardTitle>Generator Settings</CardTitle>
                    <CardDescription>Select the tour, date, and number of passengers to generate.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                             <FormField
                                control={form.control}
                                name="packageSlug"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Tour Package</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a tour package" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {tourPackages.map(pkg => (
                                            <SelectItem key={pkg.slug} value={pkg.slug}>{pkg.name}</SelectItem>
                                        ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                             />
                            <FormField
                                control={form.control}
                                name="bookingDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Booking Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={disabledDates} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="memberCount"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Number of Dummy Passengers</FormLabel>
                                    <FormControl>
                                        <Input type="number" min="1" max="20" {...field} className="w-[240px]" />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Alert>
                                <Users className="h-4 w-4" />
                                <AlertTitle>How this works</AlertTitle>
                                <AlertDescription>
                                    This tool will create multiple individual bookings with random names and ages. It will automatically find and assign available seats for the selected date.
                                </AlertDescription>
                            </Alert>

                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Generate Bookings
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

