
'use client';

import { useEffect, useState, useMemo } from 'react';
import { getTodaysAndTomorrowsBookings, getTourPackages } from '@/lib/firebase';
import type { Booking, TourPackage } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, Bell } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type GroupedBookings = {
  [date: string]: {
    [packageSlug: string]: {
      tourName: string;
      passengers: {
        bookingDate: string;
        name: string;
        phone: string;
        age: number;
        seats: string;
      }[];
    };
  };
};

export default function NotificationsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const [bookingData, packageData] = await Promise.all([
            getTodaysAndTomorrowsBookings(),
            getTourPackages()
        ]);
        bookingData.sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
        setBookings(bookingData as Booking[]);
        setTourPackages(packageData);
      } catch (err) {
        console.error('Failed to fetch upcoming bookings:', err);
        setError('Could not load upcoming bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const groupedBookings = useMemo(() => {
    const groups: GroupedBookings = {};

    bookings.forEach((booking) => {
      const dateKey = format(new Date(booking.bookingDate), 'yyyy-MM-dd');
      const tourPackage = tourPackages.find(p => p.slug === booking.packageSlug);
      if (!tourPackage) return;

      if (!groups[dateKey]) {
        groups[dateKey] = {};
      }
      if (!groups[dateKey][booking.packageSlug]) {
        groups[dateKey][booking.packageSlug] = {
          tourName: tourPackage.name,
          passengers: [],
        };
      }

      const seats = booking.selectedSeats.map(s => s.number).join(', ');
      booking.passengers.forEach(passenger => {
        groups[dateKey][booking.packageSlug].passengers.push({
          bookingDate: format(new Date(booking.bookingDate), 'dd MMM yyyy'),
          name: passenger.name,
          phone: passenger.phone,
          age: passenger.age,
          seats: seats,
        });
      });
    });

    return groups;
  }, [bookings, tourPackages]);
  
  const getDateLabel = (dateStr: string) => {
      const date = new Date(dateStr);
      if(isToday(date)) return "Today's Manifest";
      if(isTomorrow(date)) return "Tomorrow's Manifest";
      return format(date, 'PPP');
  }

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
    
    const dateKeys = Object.keys(groupedBookings).sort();
    
    if (dateKeys.length === 0) {
      return (
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertTitle>All Clear!</AlertTitle>
          <AlertDescription>There are no bookings for today or tomorrow.</AlertDescription>
        </Alert>
      );
    }

    return (
        <div className="space-y-8">
            {dateKeys.map(date => (
                <div key={date}>
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">{getDateLabel(date)}</h2>
                    <div className="space-y-6">
                        {Object.keys(groupedBookings[date]).map(pkgSlug => (
                            <Card key={pkgSlug} className="shadow-md">
                                <CardHeader>
                                    <CardTitle>{groupedBookings[date][pkgSlug].tourName}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Mobile</TableHead>
                                                <TableHead>Age</TableHead>
                                                <TableHead>Seats</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {groupedBookings[date][pkgSlug].passengers.map((passenger, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{passenger.bookingDate}</TableCell>
                                                    <TableCell className="font-medium">{passenger.name}</TableCell>
                                                    <TableCell>{passenger.phone}</TableCell>
                                                    <TableCell>{passenger.age}</TableCell>
                                                    <TableCell>{passenger.seats}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
  };

  return (
    <div className="container mx-auto max-w-6xl py-12">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="text-primary h-8 w-8" />
        <h1 className="text-3xl font-bold">Upcoming Bookings</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        Grouped passenger lists for today and tomorrow. Use these manifests to coordinate with your team.
      </p>
      {renderContent()}
    </div>
  );
}
