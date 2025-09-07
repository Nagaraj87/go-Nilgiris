
"use client";

import { useEffect, useState } from "react";
import { blockAllSeatsForDate, blockDate, blockSeatForDate, getBlockedSeatsForDate, getBookings, unblockAllSeatsForDate, unblockDate, unblockSeatForDate } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GalleryHorizontal, Lock, Ticket, ShieldOff, ImageOff, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tourPackages } from "@/lib/data";
import { SeatChart } from "@/components/seat-chart";

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

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const { toast } = useToast();

  const [availabilityDate, setAvailabilityDate] = useState<Date | undefined>(new Date());
  const [selectedPackage, setSelectedPackage] = useState<string>(tourPackages[0].slug);
  const [blockedSeats, setBlockedSeats] = useState<number[]>([]);

  const tourPackage = tourPackages.find(p => p.slug === selectedPackage);
  const totalSeats = 40; // Assuming a fixed number of seats for now

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookingsData = await getBookings();
        setBookings(bookingsData as Booking[]);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  useEffect(() => {
    if (!availabilityDate || !selectedPackage) return;
    const dateStr = format(availabilityDate, "yyyy-MM-dd");
    getBlockedSeatsForDate(selectedPackage, dateStr).then(setBlockedSeats);
  }, [availabilityDate, selectedPackage]);


  const handleBlockDate = async (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    try {
      await blockDate(dateStr);
      setBlockedDates([...blockedDates, date]);
      toast({ title: "Date Blocked", description: `Date ${format(date, "PPP")} has been blocked for all tours.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to block date." });
    }
  };
  
  const handleUnblockDate = async (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    try {
      await unblockDate(dateStr);
      setBlockedDates(blockedDates.filter(d => d.getTime() !== date.getTime()));
      toast({ title: "Date Unblocked", description: `Date ${format(date, "PPP")} has been unblocked.` });
    } catch (e) {
       toast({ variant: "destructive", title: "Error", description: "Failed to unblock date." });
    }
  }

  const handleDateSelectForBlocking = (dates: Date[] | undefined) => {
      if (!dates) return;
      // This is a simplified logic. In a real app, you'd compare the new and old arrays.
      const newDate = dates.find(d => !blockedDates.some(bd => bd.getTime() === d.getTime()));
      const removedDate = blockedDates.find(bd => !dates.some(d => d.getTime() === bd.getTime()));

      if (newDate) handleBlockDate(newDate);
      if (removedDate) handleUnblockDate(removedDate);
  }

  const handleSeatBlockToggle = async (seatNumber: number) => {
    if (!availabilityDate || !selectedPackage) return;
    const dateStr = format(availabilityDate, "yyyy-MM-dd");
    const isBlocked = blockedSeats.includes(seatNumber);

    try {
        if (isBlocked) {
            await unblockSeatForDate(selectedPackage, dateStr, seatNumber);
            setBlockedSeats(blockedSeats.filter(s => s !== seatNumber));
            toast({ title: "Seat Unblocked" });
        } else {
            await blockSeatForDate(selectedPackage, dateStr, seatNumber);
            setBlockedSeats([...blockedSeats, seatNumber]);
            toast({ title: "Seat Blocked" });
        }
    } catch (e) {
        toast({ variant: "destructive", title: "Error", description: "Could not update seat status." });
    }
  }

  const handleBlockAll = async () => {
    if (!availabilityDate || !selectedPackage) return;
    const dateStr = format(availabilityDate, "yyyy-MM-dd");
    try {
        await blockAllSeatsForDate(selectedPackage, dateStr, totalSeats);
        setBlockedSeats(Array.from({length: totalSeats}, (_, i) => i + 1));
        toast({ title: "All Seats Blocked" });
    } catch (e) {
        toast({ variant: "destructive", title: "Error", description: "Failed to block all seats."});
    }
  }
  
  const handleUnblockAll = async () => {
      if (!availabilityDate || !selectedPackage) return;
      const dateStr = format(availabilityDate, "yyyy-MM-dd");
      try {
          await unblockAllSeatsForDate(selectedPackage, dateStr);
          setBlockedSeats([]);
          toast({ title: "All Seats Unblocked" });
      } catch(e) {
          toast({ variant: "destructive", title: "Error", description: "Failed to unblock all seats." });
      }
  }


  return (
    <div className="container mx-auto max-w-7xl py-12">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="text-primary h-8 w-8"/>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
       <p className="text-muted-foreground mb-8">Manage your tours, view bookings, and analyze your business performance.</p>
      
      <Tabs defaultValue="bookings">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookings"><Ticket className="mr-2"/> Bookings</TabsTrigger>
          <TabsTrigger value="availability"><ShieldOff className="mr-2"/> Availability</TabsTrigger>
          <TabsTrigger value="gallery"><GalleryHorizontal className="mr-2"/> Gallery</TabsTrigger>
        </TabsList>
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>
                View all tour bookings submitted through the booking form.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading bookings...</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booking ID</TableHead>
                        <TableHead>Tour Package</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Seats</TableHead>
                        <TableHead>Passengers</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.bookingId}</TableCell>
                          <TableCell>{booking.packageSlug}</TableCell>
                          <TableCell>{format(new Date(booking.bookingDate), "PPP")}</TableCell>
                          <TableCell>{booking.memberCount}</TableCell>
                          <TableCell>₹{booking.totalAmount.toLocaleString('en-IN')}</TableCell>
                          <TableCell>{booking.selectedSeats.map(s => s.number).join(', ')}</TableCell>
                          <TableCell>
                            {booking.passengers.map((p, i) => (
                              <div key={i} className="text-xs">
                                {p.name} ({p.age}, {p.gender})
                              </div>
                            ))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="availability">
            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Block Entire Dates</CardTitle>
                        <CardDescription>Select dates to block all new bookings, e.g., due to bad weather or holidays.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6 flex justify-center">
                      <div className="overflow-x-auto">
                        <Calendar
                            mode="multiple"
                            selected={blockedDates}
                            onSelect={handleDateSelectForBlocking}
                            className="rounded-md border"
                        />
                      </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Individual Seats</CardTitle>
                        <CardDescription>Manually block or unblock specific seats for a tour on a particular date.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="space-y-2 flex-1">
                                <Label>Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-full justify-start pl-3 text-left font-normal", !availabilityDate && "text-muted-foreground")}>
                                            {availabilityDate ? format(availabilityDate, 'PPP') : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={availabilityDate} onSelect={setAvailabilityDate} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                             <div className="space-y-2 flex-1">
                                <Label>Tour Package</Label>
                                <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a package" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tourPackages.map(pkg => (
                                            <SelectItem key={pkg.slug} value={pkg.slug}>{pkg.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {tourPackage && availabilityDate && (
                           <div>
                                <SeatChart 
                                    totalSeats={totalSeats}
                                    seatsPerRow={4}
                                    memberCount={0}
                                    selectedSeats={[]}
                                    onSeatSelect={(seats) => handleSeatBlockToggle(seats[0].number)}
                                    pricePerSeat={tourPackage.price}
                                    adminBlockedSeats={blockedSeats}
                                    isBlockingMode={true}
                                />
                                <div className="flex gap-2 mt-4">
                                    <Button variant="destructive" onClick={handleBlockAll}>Block All</Button>
                                    <Button variant="secondary" onClick={handleUnblockAll}>Unblock All</Button>
                                </div>
                           </div>
                        )}
                        
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
         <TabsContent value="gallery">
            <Card className="min-h-[400px] flex flex-col items-center justify-center text-center">
                <CardHeader>
                    <div className="mx-auto bg-muted rounded-full p-4 w-fit">
                        <ImageOff className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <CardTitle className="mt-4">Gallery Management</CardTitle>
                    <CardDescription>This feature is coming soon. You'll be able to upload and manage your tour photos here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>Upload Photos</Button>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
