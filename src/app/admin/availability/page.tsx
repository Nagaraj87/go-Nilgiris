
"use client";

import { useEffect, useState } from "react";
import { blockAllSeatsForDate, blockSeatForDate, getAvailabilityForDate, getOccupiedSeatsForDate, unblockAllSeatsForDate, unblockSeatForDate, updateBusCountForDate } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldOff, Calendar as CalendarIcon, BusFront, Plus, Minus } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function AvailabilityPage() {
  const { toast } = useToast();

  const [availabilityDate, setAvailabilityDate] = useState<Date | undefined>(new Date());
  const [selectedPackage, setSelectedPackage] = useState<string>(tourPackages[0].slug);
  
  const [busCount, setBusCount] = useState(1);
  const [blockedSeats, setBlockedSeats] = useState<Record<number, number[]>>({ 1: [] });
  const [occupiedSeats, setOccupiedSeats] = useState<Record<number, number[]>>({ 1: [] });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isUpdatingBuses, setIsUpdatingBuses] = useState(false);

  const tourPackage = tourPackages.find(p => p.slug === selectedPackage);
  const totalSeatsPerBus = 17;

  useEffect(() => {
    if (!availabilityDate || !selectedPackage) return;
    const dateStr = format(availabilityDate, "yyyy-MM-dd");
    
    setIsLoading(true);
    Promise.all([
        getAvailabilityForDate(selectedPackage, dateStr),
        getOccupiedSeatsForDate(selectedPackage, dateStr)
    ]).then(([availability, occupied]) => {
        setBlockedSeats(availability.blockedSeats);
        setBusCount(availability.busCount);
        setOccupiedSeats(occupied);
    }).catch(err => {
        console.error(err);
        toast({ variant: "destructive", title: "Error", description: "Could not load availability data." });
    }).finally(() => {
        setIsLoading(false);
    });

  }, [availabilityDate, selectedPackage, toast]);

  const handleBusCountChange = async (change: number) => {
    if (!availabilityDate || !selectedPackage) return;
    const newCount = busCount + change;
    if (newCount < 1) return; // Must have at least one bus

    setIsUpdatingBuses(true);
    const dateStr = format(availabilityDate, "yyyy-MM-dd");
    try {
        await updateBusCountForDate(selectedPackage, dateStr, newCount);
        setBusCount(newCount);
        // Ensure data structure exists for new bus
        if (change > 0 && !blockedSeats[newCount]) {
            setBlockedSeats(prev => ({...prev, [newCount]: []}));
        }
        toast({ title: `Buses updated to ${newCount}` });
    } catch(e) {
        console.error(e);
        toast({ variant: "destructive", title: "Error", description: "Could not update bus count." });
    } finally {
        setIsUpdatingBuses(false);
    }
  }


  const handleSeatBlockToggle = async (busNumber: number, seatNumber: number) => {
    if (!availabilityDate || !selectedPackage) return;
    if (occupiedSeats[busNumber]?.includes(seatNumber)) {
        toast({ variant: "destructive", title: "Cannot Block Seat", description: "This seat is already booked by a customer." });
        return;
    }

    const dateStr = format(availabilityDate, "yyyy-MM-dd");
    const isBlocked = blockedSeats[busNumber]?.includes(seatNumber);

    try {
        if (isBlocked) {
            await unblockSeatForDate(selectedPackage, dateStr, busNumber, seatNumber);
            setBlockedSeats(prev => ({ ...prev, [busNumber]: prev[busNumber].filter(s => s !== seatNumber) }));
            toast({ title: "Seat Unblocked" });
        } else {
            await blockSeatForDate(selectedPackage, dateStr, busNumber, seatNumber);
            setBlockedSeats(prev => ({ ...prev, [busNumber]: [...(prev[busNumber] || []), seatNumber] }));
            toast({ title: "Seat Blocked" });
        }
    } catch (e) {
        console.error(e)
        toast({ variant: "destructive", title: "Error", description: "Could not update seat status." });
    }
  }

  const handleBlockAll = async (busNumber: number) => {
    if (!availabilityDate || !selectedPackage) return;
    const dateStr = format(availabilityDate, "yyyy-MM-dd");
    try {
        const availableToBlock = Array.from({length: totalSeatsPerBus}, (_, i) => i + 1).filter(seat => !(occupiedSeats[busNumber] || []).includes(seat));
        await blockAllSeatsForDate(selectedPackage, dateStr, busNumber, availableToBlock);
        setBlockedSeats(prev => ({...prev, [busNumber]: Array.from(new Set([...(prev[busNumber] || []), ...availableToBlock])) }));
        toast({ title: `All Available Seats Blocked for Bus ${busNumber}` });
    } catch (e) {
        toast({ variant: "destructive", title: "Error", description: "Failed to block all seats."});
    }
  }
  
  const handleUnblockAll = async (busNumber: number) => {
      if (!availabilityDate || !selectedPackage) return;
      const dateStr = format(availabilityDate, "yyyy-MM-dd");
      try {
          await unblockAllSeatsForDate(selectedPackage, dateStr, busNumber);
          setBlockedSeats(prev => ({...prev, [busNumber]: []}));
          toast({ title: `All Manually Blocked Seats Unblocked for Bus ${busNumber}` });
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
    
    const busTabs = Array.from({ length: busCount }, (_, i) => i + 1);

    return (
        <div className="space-y-4">
             <Card className="bg-muted/50">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                         <BusFront className="text-muted-foreground"/>
                         <Label className="text-lg font-semibold">Buses for this date</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleBusCountChange(-1)} disabled={busCount <= 1 || isUpdatingBuses}><Minus/></Button>
                        <span className="text-xl font-bold w-10 text-center">{busCount}</span>
                        <Button variant="outline" size="icon" onClick={() => handleBusCountChange(1)} disabled={isUpdatingBuses}><Plus/></Button>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="bus-1" className="w-full">
                <TabsList className={cn("grid w-full", busCount > 1 && "grid-cols-2", busCount > 2 && "grid-cols-3")}>
                    {busTabs.map(busNum => (
                        <TabsTrigger key={busNum} value={`bus-${busNum}`}>Bus {busNum}</TabsTrigger>
                    ))}
                </TabsList>

                {busTabs.map(busNum => (
                     <TabsContent key={busNum} value={`bus-${busNum}`} className="mt-4">
                        <SeatChart 
                            totalSeats={totalSeatsPerBus}
                            seatsPerRow={4}
                            memberCount={0}
                            selectedSeats={[]}
                            onSeatSelect={(seatNumber) => handleSeatBlockToggle(busNum, seatNumber)}
                            pricePerSeat={tourPackage.price}
                            adminBlockedSeats={blockedSeats[busNum] || []}
                            occupiedSeats={occupiedSeats[busNum] || []}
                            isBlockingMode={true}
                        />
                        <div className="flex gap-2 mt-4">
                            <Button variant="destructive" onClick={() => handleBlockAll(busNum)}>Block All Available</Button>
                            <Button variant="secondary" onClick={() => handleUnblockAll(busNum)}>Unblock All</Button>
                        </div>
                     </TabsContent>
                ))}
            </Tabs>
        </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl py-12">
        <div className="flex items-center gap-2 mb-4">
            <ShieldOff className="text-primary h-8 w-8"/>
            <h1 className="text-3xl font-bold">Manage Availability</h1>
        </div>
        <p className="text-muted-foreground mb-8">Manually block seats for maintenance or reservations. Add more buses for peak days.</p>
        <div className="flex justify-center">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Seat & Bus Management</CardTitle>
                    <CardDescription>Select a tour and date to manage seat availability and number of buses.</CardDescription>
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
