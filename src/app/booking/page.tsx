
"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useMemo, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { tourPackages } from '@/lib/data';
import type { TourPackage } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { SeatChart } from '@/components/seat-chart';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, ArrowRight, ArrowLeft, CreditCard, Ticket, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { saveBooking, getBlockedSeatsForDate, getOccupiedSeats, getPackagePrice } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { PassengerFields } from '@/components/booking/passenger-fields';


const passengerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().min(1, 'Age must be at least 1').max(100),
  gender: z.enum(['male', 'female', 'child']),
  phone: z.string().regex(/^[0-9]{10}$/, 'Must be a valid 10-digit phone number'),
});

const bookingSchema = z.object({
  packageSlug: z.string(),
  bookingDate: z.date({
    required_error: "A booking date is required.",
  }),
  memberCount: z.coerce.number().min(1, 'At least one member is required'),
  passengers: z.array(passengerSchema),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

function BookingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageSlug = searchParams.get('package');
  const { toast } = useToast();

  const tourPackage = useMemo(() => tourPackages.find(p => p.slug === packageSlug) || tourPackages[0], [packageSlug]);
  
  const [step, setStep] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminBlockedSeats, setAdminBlockedSeats] = useState<number[]>([]);
  const [occupiedSeats, setOccupiedSeats] = useState<number[]>([]);
  const [pricePerSeat, setPricePerSeat] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      packageSlug: tourPackage.slug,
      bookingDate: undefined,
      memberCount: 1,
      passengers: [{ name: '', age: 0, gender: 'male', phone: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'passengers',
  });

  const memberCount = form.watch('memberCount');
  const bookingDate = form.watch('bookingDate');

  useEffect(() => {
    setLoadingPrice(true);
    getPackagePrice(tourPackage.slug)
        .then(price => {
            setPricePerSeat(price);
        })
        .catch(() => {
            // fallback
            setPricePerSeat(tourPackage.price);
            toast({variant: "destructive", title: "Error", description: "Could not fetch latest price. Using default."})
        })
        .finally(() => setLoadingPrice(false));

  }, [tourPackage.slug, tourPackage.price, toast]);

  useEffect(() => {
    const currentCount = fields.length;
    const targetCount = memberCount || 0;
    if (targetCount > currentCount) {
      for (let i = 0; i < targetCount - currentCount; i++) {
        append({ name: '', age: 0, gender: 'male', phone: '' });
      }
    } else if (targetCount < currentCount) {
      for (let i = 0; i < currentCount - targetCount; i++) {
        remove(currentCount - 1 - i);
      }
    }
  }, [memberCount, append, remove, fields.length]);

  useEffect(() => {
      if(bookingDate) {
        const dateStr = format(bookingDate, "yyyy-MM-dd");
        Promise.all([
            getBlockedSeatsForDate(tourPackage.slug, dateStr),
            getOccupiedSeats(tourPackage.slug, dateStr)
        ]).then(([adminBlocked, occupied]) => {
            setAdminBlockedSeats(adminBlocked);
            setOccupiedSeats(occupied);
        })
      }
  }, [bookingDate, tourPackage.slug])


  const totalAmount = useMemo(() => {
    const seatTotal = selectedSeats.reduce((acc, seat) => acc + seat.price, 0);
    return seatTotal;
  }, [selectedSeats]);
  
  const processStep1 = async () => {
    const result = await form.trigger(['bookingDate', 'memberCount']);
    if (result) {
        if(loadingPrice || pricePerSeat === null){
            toast({variant: "destructive", title: "Price not loaded", description: "Please wait for the price to load."});
            return;
        }
        setStep(2);
    }
  };
  
  const processStep2 = async () => {
    const result = await form.trigger('passengers');
    if (!result) {
       toast({
        variant: "destructive",
        title: "Passenger Details Incomplete",
        description: "Please fill in the details for all passengers.",
      });
      return;
    }
    if (selectedSeats.length !== memberCount) {
       toast({
        variant: "destructive",
        title: "Seat Selection Incomplete",
        description: `Please select seats for all ${memberCount} members.`,
      })
      return;
    }
    setStep(3);
  };

  const processPayment = async () => {
    setIsSubmitting(true);
    const bookingId = `NE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const bookingData = {
      bookingId,
      ...form.getValues(),
      selectedSeats: selectedSeats.map(s => ({ number: s.number, price: s.price })),
      totalAmount,
      bookingDate: format(form.getValues('bookingDate'), "yyyy-MM-dd"),
    };

    try {
      await saveBooking(bookingData);
      router.push(`/booking/confirmation?bookingId=${bookingId}&package=${tourPackage.slug}`);
    } catch (error) {
      console.error("Failed to save booking:", error);
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: "Could not save your booking. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  const handleCopyToAll = () => {
    const firstPassenger = form.getValues('passengers.0');
    if (!firstPassenger) return;

    for(let i = 1; i < fields.length; i++) {
        form.setValue(`passengers.${i}.name`, firstPassenger.name, { shouldValidate: true });
        form.setValue(`passengers.${i}.age`, firstPassenger.age, { shouldValidate: true });
        form.setValue(`passengers.${i}.phone`, firstPassenger.phone, { shouldValidate: true });
    }
     toast({ title: "Details Copied", description: "Name, age, and contact number have been copied to all passengers." });
  }

  const steps = [
    { num: 1, title: "Booking Details" },
    { num: 2, title: "Passenger Info & Seats" },
    { num: 3, title: "Payment" },
  ];
  
  const isDateFullyBooked = useMemo(() => {
    const totalSeats = 40;
    const allSeats = Array.from({length: totalSeats}, (_, i) => i + 1);
    const availableSeats = allSeats.filter(s => !adminBlockedSeats.includes(s) && !occupiedSeats.includes(s));
    return availableSeats.length === 0;
  }, [adminBlockedSeats, occupiedSeats]);

  const disabledDates = (date: Date) => {
    const isPast = date < new Date(new Date().setDate(new Date().getDate() - 1));
    return isPast;
  }

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="flex items-center justify-center mb-8">
        {steps.map((s, index) => (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                  step > s.num ? "bg-primary text-primary-foreground" :
                  step === s.num ? "bg-accent text-accent-foreground" :
                  "bg-muted text-muted-foreground"
                )}
              >
                {step > s.num ? <Ticket size={20}/> : s.num}
              </div>
              <p className="text-sm mt-2 text-center">{s.title}</p>
            </div>
            {index < steps.length - 1 && <div className="w-16 h-0.5 bg-border mx-4"></div>}
          </div>
        ))}
      </div>
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Booking Details</CardTitle>
                <CardDescription>Select your tour date and number of members for the "{tourPackage.name}".</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 {loadingPrice && (
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-1/4"/>
                        <Skeleton className="h-10 w-[240px]"/>
                    </div>
                )}
                {!loadingPrice && pricePerSeat && (
                     <p className="text-lg font-semibold">Price per seat: <span className="text-primary">₹{pricePerSeat.toLocaleString('en-IN')}</span> onwards</p>
                )}
                <FormField
                  control={form.control}
                  name="bookingDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Booking Date</FormLabel>
                       {isDateFullyBooked && bookingDate && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Fully Booked</AlertTitle>
                            <AlertDescription>
                              All seats for this date are blocked or booked. Please select another date.
                            </AlertDescription>
                          </Alert>
                       )}
                      <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                           <Calendar 
                             mode="single" 
                             selected={field.value} 
                             onSelect={(date) => {
                               field.onChange(date);
                               setIsDatePickerOpen(false);
                             }} 
                             disabled={disabledDates} 
                             initialFocus 
                           />
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
                      <FormLabel>Number of Members</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} onChange={e => {
                            const value = e.target.value;
                            field.onChange(value === '' ? '' : parseInt(value, 10));
                        }} className="w-[240px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="justify-end">
                <Button onClick={processStep1} disabled={loadingPrice}>
                    {loadingPrice ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 2 && pricePerSeat !== null && (
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Passenger Details & Seat Selection</CardTitle>
                <CardDescription>Enter details for each passenger and select your seats.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <PassengerFields 
                        key={field.id} 
                        form={form} 
                        index={index} 
                        onCopyToAll={handleCopyToAll}
                        memberCount={memberCount}
                    />
                  ))}
                </div>
                <SeatChart 
                  totalSeats={40} 
                  seatsPerRow={4} 
                  memberCount={memberCount} 
                  selectedSeats={selectedSeats} 
                  onSeatSelect={setSelectedSeats} 
                  pricePerSeat={pricePerSeat}
                  adminBlockedSeats={adminBlockedSeats}
                  occupiedSeats={occupiedSeats}
                />
                 <div className="text-right text-2xl font-bold">Total: ₹{totalAmount.toLocaleString('en-IN')}</div>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button onClick={processStep2}>Proceed to Payment <CreditCard className="ml-2 h-4 w-4" /></Button>
              </CardFooter>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Payment</CardTitle>
                <CardDescription>Confirm your booking details and proceed to payment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-bold">Booking Summary</h3>
                <p><strong>Package:</strong> {tourPackage.name}</p>
                <p><strong>Date:</strong> {format(form.getValues('bookingDate'), 'PPP')}</p>
                <p><strong>Members:</strong> {memberCount}</p>
                <p><strong>Seats:</strong> {selectedSeats.map(s => s.number).join(', ')}</p>
                <div className="text-3xl font-bold text-primary">Total Amount: ₹{totalAmount.toLocaleString('en-IN')}</div>
                 <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">This is a demo. Clicking "Pay Now" will simulate a successful payment and save your booking to our database.</p>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="outline" onClick={() => setStep(2)} disabled={isSubmitting}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={processPayment} disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : "Pay Now"}
                    <CreditCard className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
}

export default function BookingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BookingFlow />
        </Suspense>
    )
}

    

    