

"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useMemo, useState, useRef } from 'react';

import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { AlertCircle, ArrowLeft, ArrowRight, Calendar as CalendarIcon, Copy, CreditCard, Loader2, Ticket } from 'lucide-react';
import { PassengerFields } from '@/components/booking/passenger-fields';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SeatChart } from '@/components/seat-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { getPackagePrice, getTourPackageBySlug } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import type { TourPackage } from '@/types';
import { load } from '@cashfreepayments/cashfree-js';
import { initiateCashfreePayment, getAvailabilityForDate } from './actions';
import { useLoading } from '@/components/loading-provider';


const passengerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().min(1, 'Age must be at least 1').max(100),
  gender: z.enum(['male', 'female', 'child'], { required_error: "Gender is required." }),
  phone: z.string().regex(/^[0-9]{10}$/, 'Must be a valid 10-digit phone number'),
});

const bookingSchema = z.object({
  packageSlug: z.string(),
  bookingDate: z.date({
    required_error: "A booking date is required.",
  }),
  passengers: z.array(passengerSchema).min(1, "At least one passenger is required."),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

function BookingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageSlugFromUrl = searchParams.get('package');
  const { toast } = useToast();

  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  const [tourPackage, setTourPackage] = useState<TourPackage | null>(null);


  const [step, setStep] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
  const { showLoader, hideLoader } = useLoading();
  const [pricePerSeat, setPricePerSeat] = useState<number | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  // Mock Payment State
  const [isGatewayReady, setIsGatewayReady] = useState(true);

  const [blockedSeats, setBlockedSeats] = useState<number[]>([]);
  const [occupiedSeats, setOccupiedSeats] = useState<number[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      packageSlug: packageSlugFromUrl || '',
      bookingDate: undefined,
      passengers: [{ name: '', age: 0, gender: undefined, phone: '' }],
    },
  });

  useEffect(() => {
    if (packageSlugFromUrl) {
      Promise.all([
        getTourPackageBySlug(packageSlugFromUrl),
        getPackagePrice(packageSlugFromUrl).catch(() => null)
      ]).then(([pkg, fetchedPrice]) => {
        if (pkg) {
          setTourPackage(pkg);
          form.setValue('packageSlug', pkg.slug);
          
          if (fetchedPrice !== null) {
            setPricePerSeat(fetchedPrice);
          } else {
            setPricePerSeat(pkg.price);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch latest price. Using default." });
          }
        }
      });
    }
  }, [packageSlugFromUrl, form, toast]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'passengers',
  });

  const memberCount = form.watch('passengers').length;
  const bookingDate = form.watch('bookingDate');

  const handleMemberCountChange = (newCountStr: string) => {
    const newCount = parseInt(newCountStr, 10);
    if (isNaN(newCount) || newCount < 1) {
      return;
    }

    const currentCount = fields.length;
    if (newCount > currentCount) {
      for (let i = 0; i < newCount - currentCount; i++) {
        append({ name: '', age: 0, gender: undefined, phone: '' });
      }
    } else if (newCount < currentCount) {
      for (let i = 0; i < currentCount - newCount; i++) {
        remove(currentCount - 1 - i);
      }
    }
  };


  useEffect(() => {
    if (bookingDate && tourPackage) {
      setLoadingAvailability(true);
      setSelectedSeats([]); // Reset seats on date change
      const dateStr = format(bookingDate, "yyyy-MM-dd");
      getAvailabilityForDate(tourPackage.slug, dateStr)
        .then(({ blocked, occupied }) => {
          setBlockedSeats(blocked || []);
          setOccupiedSeats(occupied || []);
        }).catch(err => {
          console.error(err);
          toast({ variant: "destructive", title: "Error", description: "Could not load seat availability." });
        }).finally(() => {
          setLoadingAvailability(false);
        });
    }
  }, [bookingDate, tourPackage, toast]);


  const totalAmount = useMemo(() => {
    return selectedSeats.reduce((acc, seat) => acc + seat.price, 0);
  }, [selectedSeats]);

  const processStep1 = async () => {
    const result = await form.trigger(['bookingDate']);
    if (!result || memberCount < 1) {
      toast({ variant: "destructive", title: "Incomplete Details", description: "Please select a date and number of members." })
      return;
    }

    if (pricePerSeat === null) {
      toast({ variant: "destructive", title: "Price not loaded", description: "Please wait for the price to load." });
      return;
    }

    setStep(2);
    setTimeout(() => step2Ref.current?.scrollIntoView({ behavior: 'smooth' }), 100);
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
    setTimeout(() => step3Ref.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const processPayment = async () => {
    if (!tourPackage || !isGatewayReady) return;
    
    showLoader("Connecting to secure payment gateway...");

    try {
      const { packageSlug, passengers } = form.getValues();

      const bookingData = {
        bookingId: '', 
        packageSlug,
        memberCount,
        passengers,
        selectedSeats: selectedSeats.map(s => ({ number: s.number, price: s.price })),
        totalAmount,
        bookingDate: format(form.getValues('bookingDate'), "yyyy-MM-dd"),
        paymentStatus: 'PENDING',
      };

      const result = await initiateCashfreePayment(bookingData as any, totalAmount);

      if (result.success && result.payment_session_id) {
        // Initialize Cashfree SDK
        const cashfree = await load({
            // Note: you should read this from env in production, but hardcoding for now based on env setup
            mode: process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === "PRODUCTION" ? "production" : "sandbox" 
        });

        // Launch checkout popup
        cashfree.checkout({
            paymentSessionId: result.payment_session_id
        });
        
        // Note: We do not setIsSubmitting(false) here because Cashfree takes over the screen 
        // and redirects to the return_url upon completion.
      } else {
        toast({ variant: "destructive", title: "Payment Failed", description: result.error || "Could not connect to payment gateway." });
        hideLoader();
      }
    } catch (error) {
      console.error("Error initiating Cashfree payment:", error);
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred. Please try again." });
      hideLoader();
    }
  };

  const handleCopyToAll = () => {
    const firstPassenger = form.getValues('passengers.0');
    if (!firstPassenger?.name || !firstPassenger?.age || !firstPassenger?.phone) {
      toast({ variant: "destructive", title: "Incomplete Details", description: "Please fill all details for the first passenger before copying." });
      return;
    }

    const currentPassengers = form.getValues('passengers');
    const newPassengers = currentPassengers.map((passenger, index) => {
      if (index === 0) return passenger;
      return {
        ...passenger,
        name: firstPassenger.name,
        age: firstPassenger.age,
        phone: firstPassenger.phone,
      };
    });

    form.setValue('passengers', newPassengers, { shouldValidate: true, shouldDirty: true });

    toast({ title: "Details Copied", description: "Name, Age, and Phone from the first passenger have been copied to all others." });
  }

  const handleSeatSelect = (seat: any, isSelected: boolean) => {
    if (isSelected) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= memberCount) {
        toast({ title: "Selection limit reached", description: "You cannot select more seats than the number of members." });
        return;
      }
      setSelectedSeats(prev => [...prev, seat]);
    }
  };


  const steps = [
    { num: 1, title: "Booking Details" },
    { num: 2, title: "Passenger Info & Seats" },
    { num: 3, title: "Payment" },
  ];

  const isDateFullyBooked = useMemo(() => {
    if (loadingAvailability) return false;
    const totalBooked = new Set([...occupiedSeats, ...blockedSeats]).size;
    return totalBooked >= 17; // Total seats
  }, [occupiedSeats, blockedSeats, loadingAvailability]);

  const disabledDates = (date: Date) => {
    return date < new Date(new Date().setDate(new Date().getDate() - 1));
  }

  if (!tourPackage) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
  }

  return (
    <div className="container mx-auto max-w-4xl py-12">
      {/* Removed Razorpay script injection */}
      <div className="flex items-start justify-between mb-8">
        {steps.map((s, index) => (
          <React.Fragment key={s.num}>
            <div className="flex flex-col items-center text-center w-28 sm:w-auto">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors",
                  step > s.num ? "bg-primary text-primary-foreground" :
                    step === s.num ? "bg-accent text-accent-foreground" :
                      "bg-muted text-muted-foreground"
                )}
              >
                {step > s.num ? <Ticket size={20} /> : s.num}
              </div>
              <p className="text-xs sm:text-sm mt-2 text-center break-words">{s.title}</p>
            </div>
            {index < steps.length - 1 && <div className="flex-grow h-0.5 bg-border mt-5 mx-2 sm:mx-4"></div>}
          </React.Fragment>
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
                {pricePerSeat === null ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-10 w-[240px]" />
                  </div>
                ) : (
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
                <div className="space-y-2">
                  <Label htmlFor="member-count">Number of Members</Label>
                  <Input
                    id="member-count"
                    type="number"
                    min="1"
                    value={memberCount}
                    onChange={e => handleMemberCountChange(e.target.value)}
                    className="w-[240px]"
                  />
                  <FormMessage>{form.formState.errors.passengers?.root?.message}</FormMessage>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button onClick={processStep1} disabled={pricePerSeat === null || loadingAvailability}>
                  {loadingAvailability ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {pricePerSeat === null ? 'Loading...' : 'Next'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 2 && pricePerSeat !== null && (
            <Card ref={step2Ref}>
              <CardHeader>
                <CardTitle>Step 2: Passenger Details & Seat Selection</CardTitle>
                <CardDescription>Enter details for each passenger and select your seats.</CardDescription>
                {memberCount > 1 && (
                  <div className="pt-2">
                    <Button type="button" size="sm" variant="outline" onClick={handleCopyToAll}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy first passenger's details to all
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4">
                      <Label className="font-bold">Passenger {index + 1}</Label>
                      <PassengerFields form={form} index={index} />
                    </div>
                  ))}
                </div>

                {loadingAvailability ? <Skeleton className="w-full h-96" /> : (
                  <SeatChart
                    totalSeats={17}
                    seatsPerRow={4}
                    memberCount={memberCount}
                    selectedSeats={selectedSeats}
                    onSeatSelect={handleSeatSelect}
                    pricePerSeat={pricePerSeat}
                    occupiedSeats={occupiedSeats}
                    adminBlockedSeats={blockedSeats}
                  />
                )}

                <div className="text-right text-2xl font-bold">Total: ₹{totalAmount.toLocaleString('en-IN')}</div>
              </CardContent>
              <CardFooter className="flex-wrap justify-between gap-4">
                <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button onClick={processStep2}><CreditCard className="mr-2 h-4 w-4" /> Proceed to Payment</Button>
              </CardFooter>
            </Card>
          )}

          {step === 3 && (
            <Card ref={step3Ref}>
              <CardHeader>
                <CardTitle>Step 3: Confirm & Pay</CardTitle>
                <CardDescription>You are just one step away from confirming your adventure.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 bg-muted rounded-lg space-y-4">
                  <div className="flex justify-between items-center text-lg flex-wrap gap-2">
                    <span className="font-semibold">{tourPackage.name} ({memberCount} x ₹{pricePerSeat})</span>
                    <span className="font-bold text-xl sm:text-2xl whitespace-nowrap">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-sm text-muted-foreground border-t border-muted-foreground/20 pt-4 mt-4">
                    <p><strong>Date:</strong> {bookingDate && format(bookingDate, 'PPP')}</p>
                    <p><strong>Seats:</strong> {selectedSeats.map(s => s.number).join(', ')}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row sm:justify-between w-full gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="w-full sm:w-auto"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button onClick={processPayment} disabled={!isGatewayReady} className="w-full sm:w-auto">
                  <CreditCard className="mr-2 h-4 w-4" />
                  {isGatewayReady ? 'Confirm Payment' : 'Loading Gateway...'}
                </Button>
              </CardFooter>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
}

const BookingPage = () => (
  <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
    <BookingFlow />
  </Suspense>
)

export default BookingPage;
