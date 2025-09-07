
'use client';

import { useEffect, useState } from 'react';
import { getTodaysAndTomorrowsBookings } from '@/lib/firebase';
import type { Booking } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, Bell, Ticket, User, Calendar as CalendarIcon, Bus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { tourPackages } from '@/lib/data';

export default function NotificationsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTodaysAndTomorrowsBookings();
        data.sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
        setBookings(data as Booking[]);
      } catch (err) {
        console.error('Failed to fetch upcoming bookings:', err);
        setError('Could not load upcoming bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading upcoming bookings...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (bookings.length === 0) {
      return (
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertTitle>All Clear!</AlertTitle>
          <AlertDescription>There are no bookings for today or tomorrow.</AlertDescription>
        </Alert>
      );
    }

    const todayStr = new Date().toLocaleDateString();
    const todaysBookings = bookings.filter((b) => new Date(b.bookingDate).toLocaleDateString() === todayStr);
    const tomorrowsBookings = bookings.filter((b) => new Date(b.bookingDate).toLocaleDateString() !== todayStr);

    return (
      <div className="space-y-8">
        {todaysBookings.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Today's Bookings</h2>
            <div className="space-y-4">
              {todaysBookings.map((booking) => (
                <BookingDetailsCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}

        {tomorrowsBookings.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Tomorrow's Bookings</h2>
            <div className="space-y-4">
              {tomorrowsBookings.map((booking) => (
                <BookingDetailsCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="text-primary h-8 w-8" />
        <h1 className="text-3xl font-bold">Upcoming Bookings</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        Here are the scheduled bookings for today and tomorrow. Use this information to make necessary arrangements.
      </p>
      {renderContent()}
    </div>
  );
}

function BookingDetailsCard({ booking }: { booking: Booking }) {
    const tourPackage = tourPackages.find(p => p.slug === booking.packageSlug);

    return (
        <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl">Booking ID: {booking.bookingId}</CardTitle>
                        <CardDescription>
                            Booked on {format(new Date(booking.bookingDate), 'PPP')}
                        </CardDescription>
                    </div>
                     <Badge variant="secondary" className="flex items-center gap-2">
                        <Bus size={14}/> {tourPackage?.name || booking.packageSlug}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                     <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground"/>
                        <span>Date: <span className="font-semibold">{format(new Date(booking.bookingDate), "dd MMM yyyy")}</span></span>
                    </div>
                     <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground"/>
                        <span>Members: <span className="font-semibold">{booking.memberCount}</span></span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-muted-foreground"/>
                        <span>Seats: <span className="font-semibold">{booking.selectedSeats.map(s => s.number).join(', ')}</span></span>
                    </div>
                </div>
                <Separator />
                 <div>
                    <h4 className="font-semibold mb-2">Passenger Details</h4>
                    <ul className="space-y-2">
                        {booking.passengers.map((passenger, index) => (
                            <li key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                                <span className="font-medium">{passenger.name}</span>
                                <div className="flex gap-4 text-xs text-muted-foreground">
                                    <span>Age: {passenger.age}</span>
                                    <span>Gender: {passenger.gender}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}
