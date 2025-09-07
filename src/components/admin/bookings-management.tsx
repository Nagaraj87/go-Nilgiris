
"use client";

import { useEffect, useState } from "react";
import { getBookings, deleteAllBookings as deleteAllBookingsFromDb } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Search, Loader2, Trash } from "lucide-react";
import { BookingsTable } from "./bookings-table";
import type { Booking } from "@/types";
import { Button } from "../ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";


export function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

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

  const handleDeleteBooking = (bookingId: string) => {
    setBookings(bookings.filter(b => b.id !== bookingId));
  }
  
  const handleDeleteAll = async () => {
    try {
      await deleteAllBookingsFromDb();
      setBookings([]);
      toast({ title: "Success", description: "All bookings have been deleted." });
    } catch(e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Could not delete all bookings." });
    } finally {
        setIsDeleteAllOpen(false);
    }
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
    <>
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex-1">
                <CardTitle>All Bookings</CardTitle>
                 <CardDescription>
                    View all tour bookings. Use the search below to filter results.
                </CardDescription>
            </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{filteredBookings.length} booking(s)</Badge>
             <Button variant="destructive" onClick={() => setIsDeleteAllOpen(true)} disabled={bookings.length === 0}>
                <Trash className="mr-2"/>
                Delete All
            </Button>
          </div>
        </div>
       
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
     <AlertDialog open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all bookings from the database.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive hover:bg-destructive/90">Delete All</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
