
"use client";

import { useEffect, useState } from "react";
import { getBookings } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Search, Loader2 } from "lucide-react";
import { BookingsTable } from "./bookings-table";
import type { Booking } from "@/types";

export function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const bookingsData = await getBookings();
        setBookings(bookingsData as Booking[]);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
        setError("Failed to fetch bookings. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleDeleteBooking = (bookingId: string) => {
    setBookings(bookings.filter(b => b.id !== bookingId));
  }

  const filteredBookings = bookings.filter(booking => {
    const query = searchQuery.toLowerCase();
    return (
        booking.bookingId.toLowerCase().includes(query) ||
        booking.packageSlug.toLowerCase().includes(query) ||
        booking.passengers.some(p => p.name.toLowerCase().includes(query))
    );
  });

  const renderContent = () => {
    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Loading bookings...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    return (
        <BookingsTable
            bookings={filteredBookings}
            onBookingDeleted={handleDeleteBooking}
            searchQuery={searchQuery}
        />
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle>All Bookings</CardTitle>
          <Badge variant="secondary">{filteredBookings.length} booking(s)</Badge>
        </div>
        <CardDescription>
          View all tour bookings. Use the search below to filter results.
        </CardDescription>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by Booking ID, package, or passenger name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
            disabled={loading || !!error}
          />
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
