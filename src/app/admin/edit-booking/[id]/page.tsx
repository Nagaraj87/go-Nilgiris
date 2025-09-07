
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getBookingById, updateBooking } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { WomanIcon } from '@/components/icons';
import { User, Baby } from 'lucide-react';

const passengerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().min(1, 'Age must be at least 1').max(100),
  gender: z.enum(['male', 'female', 'child']),
});

const editBookingSchema = z.object({
  passengers: z.array(passengerSchema),
});

type EditBookingFormValues = z.infer<typeof editBookingSchema>;

type Booking = {
    id: string;
    bookingId: string;
    packageSlug: string;
    bookingDate: string;
    memberCount: number;
    totalAmount: number;
    passengers: { name: string; age: number; gender: string }[];
    selectedSeats: { number: number; price: number }[];
};


export default function EditBookingPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditBookingFormValues>({
    resolver: zodResolver(editBookingSchema),
    defaultValues: {
      passengers: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
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
          setBooking(bookingData as Booking);
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
  }, [bookingId, router, toast, form]);

  const onSubmit = async (data: EditBookingFormValues) => {
    setIsSubmitting(true);
    try {
      await updateBooking(bookingId, { passengers: data.passengers });
      toast({ title: 'Success', description: 'Booking updated successfully.' });
      router.push('/admin');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update booking.' });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
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
                    <Button onClick={() => router.push('/admin')}>
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <FormField control={form.control} name={`passengers.${index}.name`} render={({ field }) => (
                            <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField control={form.control} name={`passengers.${index}.age`} render={({ field }) => (
                            <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField control={form.control} name={`passengers.${index}.gender`} render={({ field }) => (
                            <FormItem><FormLabel>Gender</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 pt-2">
                              <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal flex items-center gap-1"><User size={16}/> Male</FormLabel></FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal flex items-center gap-1"><WomanIcon className="h-4 w-4" /> Female</FormLabel></FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="child" /></FormControl><FormLabel className="font-normal flex items-center gap-1"><Baby size={16}/> Child</FormLabel></FormItem>
                            </RadioGroup></FormControl><FormMessage /></FormItem>
                         )} />
                      </div>
                    </div>
                  ))}
                </div>
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.push('/admin')}>
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
