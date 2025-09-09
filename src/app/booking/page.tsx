
"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useMemo, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { TourPackage } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { SeatChart } from '@/components/seat-chart';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, ArrowRight, ArrowLeft, CreditCard, Ticket, AlertCircle, Loader2, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { saveBooking, getBlockedSeatsForDate, getOccupiedSeatsForDate, getPackagePrice, getTourPackageBySlug } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PassengerFields } from '@/components/booking/passenger-fields';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { createOrder } from '@/lib/razorpay';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  passengers: z.array(passengerSchema).min(1, "At least one passenger is required."),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

function BookingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageSlugFromUrl = searchParams.get('package');
  const { toast } = useToast();

  const [tourPackage, setTourPackage] = useState<TourPackage | null>(null);

  
  const [step, setStep] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pricePerSeat, setPricePerSeat] = useState<number | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  const [blockedSeats, setBlockedSeats] = useState<number[]>([]);
  const [occupiedSeats, setOccupiedSeats] = useState<number[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      packageSlug: packageSlugFromUrl || '',
      bookingDate: undefined,
      passengers: [{ name: '', age: 0, gender: 'male', phone: '' }],
    },
  });

  useEffect(() => {
    if (packageSlugFromUrl) {
        getTourPackageBySlug(packageSlugFromUrl).then(pkg => {
            if (pkg) {
                setTourPackage(pkg);
                form.setValue('packageSlug', pkg.slug);
            }
        });
    }
  }, [packageSlugFromUrl, form]);


  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'passengers',
  });

  const memberCount = form.watch('passengers').length;
  const bookingDate = form.watch('bookingDate');

  useEffect(() => {
    if (!tourPackage) return;
    setLoadingAvailability(true);
    getPackagePrice(tourPackage.slug)
        .then(price => setPricePerSeat(price))
        .catch(() => {
            setPricePerSeat(tourPackage.price);
            toast({variant: "destructive", title: "Error", description: "Could not fetch latest price. Using default."})
        })
  }, [tourPackage, toast]);

  const handleMemberCountChange = (newCountStr: string) => {
    const newCount = parseInt(newCountStr, 10);
    if (isNaN(newCount) || newCount < 1) {
        remove();
        return;
    }
    
    const currentCount = fields.length;
    if (newCount > currentCount) {
        for (let i = 0; i < newCount - currentCount; i++) {
            append({ name: '', age: 0, gender: 'male', phone: '' });
        }
    } else if (newCount < currentCount) {
        for (let i = 0; i < currentCount - newCount; i++) {
            remove(currentCount - 1 - i);
        }
    }
  };


  useEffect(() => {
      if(bookingDate && tourPackage) {
        setLoadingAvailability(true);
        setSelectedSeats([]); // Reset seats on date change
        const dateStr = format(bookingDate, "yyyy-MM-dd");
        Promise.all([
            getBlockedSeatsForDate(tourPackage.slug, dateStr),
            getOccupiedSeatsForDate(tourPackage.slug, dateStr)
        ]).then(([blocked, occupied]) => {
            setBlockedSeats(blocked);
            setOccupiedSeats(occupied);
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
    const isDateValid = await form.trigger('bookingDate');
    if (!isDateValid) {
        return;
    }

    if(pricePerSeat === null){
        toast({variant: "destructive", title: "Price not loaded", description: "Please wait for the price to load."});
        return;
    }
    if (memberCount < 1) {
        form.setError('passengers', { type: 'manual', message: 'You must have at least one member.' });
        return;
    }
    
    setStep(2);
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
    if (!tourPackage) return;
    setIsSubmitting(true);
    
    try {
        const order = await createOrder(totalAmount);
        
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
            amount: order.amount,
            currency: order.currency,
            name: 'Go Nilgiris',
            description: `Booking for ${tourPackage.name}`,
            order_id: order.id,
            handler: async (response: any) => {
                const bookingId = `NE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
                const { packageSlug, passengers } = form.getValues();

                const bookingData = {
                  bookingId,
                  packageSlug,
                  memberCount,
                  passengers,
                  selectedSeats: selectedSeats.map(s => ({ number: s.number, price: s.price })),
                  totalAmount,
                  bookingDate: format(form.getValues('bookingDate'), "yyyy-MM-dd"),
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                };
                
                try {
                    const dbId = await saveBooking(bookingData);
                    router.push(`/booking/confirmation?id=${dbId}&bookingId=${bookingId}&package=${tourPackage.slug}`);
                } catch(e) {
                     toast({ variant: "destructive", title: "Booking Failed", description: "Payment was successful but we failed to save your booking. Please contact support." });
                     setIsSubmitting(false);
                }
            },
            prefill: {
                name: form.getValues('passengers.0.name'),
                contact: form.getValues('passengers.0.phone'),
            },
            theme: {
                color: "#166534"
            }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any){
            toast({ variant: "destructive", title: "Payment Failed", description: response.error.description });
            setIsSubmitting(false);
        });
        rzp.open();

    } catch (error) {
        console.error("Failed to create order:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not initiate payment. Please try again." });
        setIsSubmitting(false);
    }
  };

  const handleCopyToAll = () => {
    const firstPassenger = form.getValues('passengers.0');
    if (!firstPassenger) return;

    const currentPassengers = form.getValues('passengers');
    const newPassengers = currentPassengers.map((passenger, index) => {
        // Keep the original passenger if it's the first one, otherwise copy
        return index === 0 ? passenger : { ...firstPassenger };
    });
    
    form.setValue('passengers', newPassengers, { shouldValidate: true, shouldDirty: true });

    toast({ title: "Details Copied", description: "Name, age, gender and contact number have been copied to all passengers." });
  }

  const handleSeatSelect = (seat: any, isSelected: boolean) => {
    if (isSelected) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= memberCount) {
        toast({ title: "Selection limit reached", description: "You cannot select more seats than the number of members."});
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
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
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
                 {pricePerSeat === null ? (
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-1/4"/>
                        <Skeleton className="h-10 w-[240px]"/>
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
                    {(pricePerSeat === null || loadingAvailability) && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
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
                 {memberCount > 1 && (
                    <div className="pt-2">
                        <Button type="button" size="sm" variant="outline" onClick={handleCopyToAll} className="gap-1">
                            <Copy size={12}/>
                            Copy first passenger details to all
                        </Button>
                    </div>
                )}
              </CardHeader>
              <CardContent className="space-y-8">
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
              <CardFooter className="justify-between">
                <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button onClick={processStep2}><CreditCard className="mr-2 h-4 w-4"/> Proceed to Payment</Button>
              </CardFooter>
            </Card>
          )}

          {step === 3 && (
            <Card>
                <CardHeader>
                    <CardTitle>Step 3: Confirm & Pay</CardTitle>
                    <CardDescription>You are just one step away from confirming your adventure.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="p-6 bg-muted rounded-lg space-y-4">
                        <div className="flex justify-between items-center text-lg">
                            <span>{tourPackage.name} ({memberCount} x ₹{pricePerSeat})</span>
                            <span className="font-bold">₹{totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <p><strong>Date:</strong> {format(bookingDate, 'PPP')}</p>
                            <p><strong>Seats:</strong> {selectedSeats.map(s => s.number).join(', ')}</p>
                        </div>
                     </div>
                </CardContent>
                <CardFooter className="justify-between">
                    <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                    <Button onClick={processPayment} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CreditCard className="mr-2 h-4 w-4"/>}
                        Pay Now
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
