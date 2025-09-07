
"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import { deleteBooking, getBookings } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GalleryHorizontal, Lock, Ticket, ShieldOff, ImageOff, Calendar, ArrowRight, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

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
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

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

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;
    try {
        await deleteBooking(bookingToDelete);
        setBookings(bookings.filter(b => b.id !== bookingToDelete));
        toast({ title: "Booking Deleted", description: "The booking has been successfully deleted." });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete booking." });
    } finally {
        setBookingToDelete(null);
    }
  }

  const handleEditBooking = (bookingId: string) => {
    router.push(`/admin/edit-booking/${bookingId}`);
  };


  return (
    <div className="container mx-auto max-w-7xl py-12">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="text-primary h-8 w-8"/>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
       <p className="text-muted-foreground mb-8">Manage your tours, view bookings, and update your site content.</p>
      
      <Tabs defaultValue="bookings">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookings"><Ticket className="mr-2"/> Bookings</TabsTrigger>
          <TabsTrigger value="availability"><Calendar className="mr-2"/> Availability</TabsTrigger>
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
                        <TableHead className="text-right">Actions</TableHead>
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
                          <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditBooking(booking.id)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setBookingToDelete(booking.id)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
            <Card className="min-h-[400px]">
                <CardHeader>
                     <div className="mx-auto bg-muted rounded-full p-4 w-fit">
                        <Calendar className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-center">Manage Availability</CardTitle>
                    <CardDescription className="text-center">
                        Block entire dates or manage individual seats for specific tours.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Button asChild>
                        <Link href="/admin/availability">
                           Go to Availability Page <ArrowRight className="ml-2"/>
                        </Link>
                    </Button>
                </CardContent>
            </Card>
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
      <AlertDialog open={!!bookingToDelete} onOpenChange={(open) => !open && setBookingToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the booking and release the seats.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setBookingToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteBooking} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
