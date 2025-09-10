

"use client";

import { useEffect, useState } from "react";
import { blockAllSeatsForDate, blockSeatForDate, getBlockedSeatsForDate, getOccupiedSeatsForDate, unblockAllSeatsForDate, unblockSeatForDate, getTourPackages } from "@/lib/firebase";
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
import { SeatChart } from "@/components/seat-chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { TourPackage } from "@/types";

export default function AvailabilityPage() {
  const { toast } = useToast();

  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);
  const [availabilityDate, setAvailabilityDate] = useState<Date | undefined>(new Date());
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  
  const [blockedSeats, setBlockedSeats] = useState<number[]>([]);
  const [occupiedSeats, setOccupiedSeats] = useState<number[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [loadingTours, setLoadingTours] = useState(true);

  useEffect(() => {
    getTourPackages().then(packages => {
      setTourPackages(packages);
      if (packages.length > 0) {
        setSelectedPackage(packages[0].slug);
      }
      setLoadingTours(false);
    });
  }, []);

  const tourPackage = tourPackages.find(p => p.slug === selectedPackage);
  const totalSeatsPerBus = 17;

  useEffect(() => {
    if (!availabilityDate || !selectedPackage) return;
    const dateStr = format(availabilityDate, "yyyy-MM-dd");
    
    setIsLoading(true);
    Promise.all([
        getBlockedSeatsForDate(selectedPackage, dateStr),
        getOccupiedSeatsForDate(selectedPackage, dateStr)
    ]).then(([blocked, occupied]) => {
        setBlockedSeats(blocked || []);
        setOccupiedSeats(occupied || []);
    }).catch(err => {
        console.error(err);
        toast({ variant: "destructive", title: "Error", description: "Could not load availability data." });
    }).finally(() => {
        setIsLoading(false);
    });

  }, [availabilityDate, selectedPackage, toast]);

  const handleSeatBlockToggle = async (seatNumber: number) => {
    if (!availabilityDate || !selectedPackage) return;
    if (occupiedSeats.includes(seatNumber)) {
        toast({ variant: "destructive", title: "Cannot Block Seat", description: "This seat is already booked by a customer." });
        return;
    }

    const dateStr = format(availabilityDate, "yyyy-MM-dd");
    const isBlocked = blockedSeats.includes(seatNumber);
    
    try {
        if (isBlocked) {
            await unblockSeatForDate(selectedPackage, dateStr, seatNumber);
            setBlockedSeats(prev => prev.filter(s => s !== seatNumber));
            toast({ title: "Seat Unblocked" });
        } else {
            await blockSeatForDate(selectedPackage, dateStr, seatNumber);
            setBlockedSeats(prev => [...prev, seatNumber]);
            toast({ title: "Seat Blocked" });
        }
    } catch (e) {
        console.error(e)
        toast({ variant: "destructive", title: "Error", description: "Could not update seat status." });
    }
  }

  const handleBlockAll = async () => {
    if (!availabilityDate || !selectedPackage) return;
    const dateStr = format(availabilityDate, "yyyy-MM-dd");
    try {
        const availableToBlock = Array.from({length: totalSeatsPerBus}, (_, i) => i + 1).filter(seat => !occupiedSeats.includes(seat));
        await blockAllSeatsForDate(selectedPackage, dateStr, availableToBlock);
        setBlockedSeats(Array.from(new Set([...blockedSeats, ...availableToBlock])));
        toast({ title: `All Available Seats Blocked` });
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
          toast({ title: `All Manually Blocked Seats Unblocked` });
      } catch(e) {
          toast({ variant: "destructive", title: "Error", description: "Failed to unblock all seats." });
      }
  }
  
  const renderSeatManagement = () => {
    if (isLoading) {
        return <Skeleton className="h-96 w-full" />;
    }
    
    if (!tourPackage || !availabilityDate) {
        return null;
    }

    return (
        <div className="space-y-4 mt-6">
            <SeatChart 
                totalSeats={totalSeatsPerBus}
                seatsPerRow={4}
                memberCount={0} // Not needed for admin
                selectedSeats={[]} // Not needed for admin
                onSeatSelect={(seatNumber) => handleSeatBlockToggle(seatNumber)}
                pricePerSeat={tourPackage.price}
                adminBlockedSeats={blockedSeats}
                occupiedSeats={occupiedSeats}
                isBlockingMode={true}
            />
            <div className="flex gap-2 mt-4">
                <Button variant="destructive" onClick={handleBlockAll}>Block All Available</Button>
                <Button variant="secondary" onClick={handleUnblockAll}>Unblock All</Button>
            </div>
        </div>
    )
  }

  if (loadingTours) {
    return <div className="container mx-auto max-w-7xl py-12">Loading...</div>
  }

  return (
    <div className="container mx-auto max-w-7xl py-12">
        <div className="flex items-center gap-2 mb-4">
            <ShieldOff className="text-primary h-8 w-8"/>
            <h1 className="text-3xl font-bold">Manage Availability</h1>
        </div>
        <p className="text-muted-foreground mb-8">Manually block seats for maintenance or reservations.</p>
        <div className="flex justify-center">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Seat Management</CardTitle>
                    <CardDescription>Select a tour and date to manage seat availability.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="space-y-2 flex-1">
                            <Label>Date</Label>
                            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full justify-start pl-3 text-left font-normal", !availabilityDate && "text-muted-foreground")}>
                                        {availabilityDate ? format(availabilityDate, 'PPP') : <span>Pick a date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar 
                                        mode="single" 
                                        selected={availabilityDate} 
                                        onSelect={(date) => {
                                            setAvailabilityDate(date);
                                            setIsDatePickerOpen(false);
                                        }} 
                                        initialFocus 
                                    />
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
                    {renderSeatManagement()}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
