
"use client";

import { useEffect, useState } from "react";
import { blockAllSeatsForDate, blockDate, blockSeatForDate, getBlockedSeatsForDate, unblockAllSeatsForDate, unblockDate, unblockSeatForDate } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldOff, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tourPackages } from "@/lib/data";
import { SeatChart } from "@/components/seat-chart";

export default function AvailabilityPage() {
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const { toast } = useToast();

  const [availabilityDate, setAvailabilityDate] = useState<Date | undefined>(new Date());
  const [selectedPackage, setSelectedPackage] = useState<string>(tourPackages[0].slug);
  const [blockedSeats, setBlockedSeats] = useState<number[]>([]);

  const tourPackage = tourPackages.find(p => p.slug === selectedPackage);
  const totalSeats = 40; // Assuming a fixed number of seats for now

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
            <ShieldOff className="text-primary h-8 w-8"/>
            <h1 className="text-3xl font-bold">Manage Availability</h1>
        </div>
        <p className="text-muted-foreground mb-8">Block dates for all tours or manage seats for specific tours.</p>
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
    </div>
  );
}
