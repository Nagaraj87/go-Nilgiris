"use client";

import { useEffect, useState } from "react";
import { getBookings } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Lock, User, Calendar, Ticket } from "lucide-react";
import { format } from "date-fns";

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

  return (
    <div className="container mx-auto max-w-7xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="text-primary"/>
            Admin Dashboard
          </CardTitle>
          <CardDescription>
            View all tour bookings submitted through the booking form.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading bookings...</p>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
