
"use client";

import { useEffect, useState } from "react";
import { getTodaysAndTomorrowsBookings } from "@/lib/firebase";
import type { Booking } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, Loader2, AlertCircle, Ticket } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

export function NotificationBell() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getTodaysAndTomorrowsBookings();
                // Sort bookings by date
                data.sort((a,b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
                setBookings(data as Booking[]);
            } catch (err) {
                console.error("Failed to fetch upcoming bookings:", err);
                setError("Could not load upcoming bookings.");
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
        // Refresh every 5 minutes
        const intervalId = setInterval(fetchBookings, 5 * 60 * 1000); 

        return () => clearInterval(intervalId);
    }, []);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            );
        }

        if (error) {
            return (
                <Alert variant="destructive" className="m-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            );
        }

        if (bookings.length === 0) {
            return <p className="p-4 text-sm text-muted-foreground">No bookings for today or tomorrow.</p>;
        }

        const todayStr = new Date().toLocaleDateString();
        const todaysBookings = bookings.filter(b => new Date(b.bookingDate).toLocaleDateString() === todayStr);
        const tomorrowsBookings = bookings.filter(b => new Date(b.bookingDate).toLocaleDateString() !== todayStr);


        return (
            <div className="max-h-96 overflow-y-auto">
                {todaysBookings.length > 0 && (
                    <div className="p-2">
                        <h4 className="font-semibold px-2 py-1">Today's Bookings</h4>
                        <div className="flex flex-col gap-1">
                             {todaysBookings.map(booking => (
                                <BookingNotificationItem key={booking.id} booking={booking} />
                             ))}
                        </div>
                    </div>
                )}
                 {todaysBookings.length > 0 && tomorrowsBookings.length > 0 && <Separator />}

                {tomorrowsBookings.length > 0 && (
                     <div className="p-2">
                        <h4 className="font-semibold px-2 py-1">Tomorrow's Bookings</h4>
                         <div className="flex flex-col gap-1">
                            {tomorrowsBookings.map(booking => (
                                <BookingNotificationItem key={booking.id} booking={booking} />
                             ))}
                        </div>
                    </div>
                )}
            </div>
        )
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {bookings.length > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-destructive text-xs text-destructive-foreground items-center justify-center">{bookings.length}</span>
                        </span>
                    )}
                    <span className="sr-only">Upcoming Bookings</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
                <div className="p-4">
                    <h3 className="text-lg font-semibold">Upcoming Bookings</h3>
                    <p className="text-sm text-muted-foreground">Arrangements for today and tomorrow.</p>
                </div>
                 <Separator />
                {renderContent()}
            </PopoverContent>
        </Popover>
    );
}

function BookingNotificationItem({ booking }: { booking: Booking }) {
    return (
        <div className="p-2 hover:bg-muted rounded-md">
            <div className="flex justify-between items-center">
                <span className="text-sm font-bold">{booking.bookingId}</span>
                <Badge variant="outline">{booking.packageSlug}</Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Ticket className="w-3 h-3"/>
                <span>{booking.memberCount} Passenger(s)</span>
            </div>
        </div>
    )
}
