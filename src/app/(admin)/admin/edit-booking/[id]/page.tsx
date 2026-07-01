
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getBookingById } from '@/lib/firebase';
import { updateBookingAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Booking as BookingType } from '@/types';


const passengerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().min(1, 'Age must be at least 1').max(100),
  gender: z.enum(['male', 'female', 'child']),
  phone: z.string().regex(/^[0-9]{10}$/, 'Must be a valid 10-digit phone number'),
});

const editBookingSchema = z.object({
  passengers: z.array(passengerSchema),
});

type EditBookingFormValues = z.infer<typeof editBookingSchema>;


export default function EditBookingPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditBookingFormValues>({
    resolver: zodResolver(editBookingSchema),
    defaultValues: {
      passengers: [],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'passengers',
  });

  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      setLoading(true);
      try {
        const bookingData = await getBookingById(bookingId);
        if (bookingData) {
          setBooking(bookingData as BookingType);
          form.reset({ passengers: bookingData.passengers });
        } else {
          toast({ variant: 'destructive', title: 'Error', description: 'Booking not found.' });
          setBooking(null);
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch booking details.' });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId, toast, form]);

  const onSubmit = async (data: EditBookingFormValues) => {
    setIsSubmitting(true);
    const result = await updateBookingAction(bookingId, data.passengers);
    
    if (result.success) {
        toast({ title: 'Success', description: 'Booking updated successfully.' });
        router.push(`/admin`);
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    
    setIsSubmitting(false);
  };
  
  if (loading) {
      return (
          <div className="flex justify-center items-center h-screen">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
}

if (!booking) {
    return (
        <div className="container mx-auto max-w-2xl py-12">
            <Card>
                <CardHeader>
                    <CardTitle>Booking Not Found</CardTitle>
                    <CardDescription>
                        The booking you are looking for does not exist or could not be loaded.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.push(`/admin`)}>
                        Back to Admin Dashboard
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card>
        <CardHeader>
          <CardTitle>Edit Booking</CardTitle>
          <CardDescription>
            Editing booking ID: <span className="font-bold text-primary">{booking.bookingId}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
               <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4">
                      <Label className="font-bold">Passenger {index + 1}</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                         <FormField control={form.control} name={`passengers.${index}.name`} render={({ field }) => (
                            <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField control={form.control} name={`passengers.${index}.age`} render={({ field }) => (
                            <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField control={form.control} name={`passengers.${index}.phone`} render={({ field }) => (
                            <FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField control={form.control} name={`passengers.${index}.gender`} render={({ field }) => (
                             <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="child">Child</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                             </FormItem>
                         )} />
                      </div>
                    </div>
                  ))}
                </div>
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.push(`/admin`)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
