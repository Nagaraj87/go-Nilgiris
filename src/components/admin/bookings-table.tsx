
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import type { Booking } from "@/types";
import { deleteBooking } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "../ui/badge";

type BookingsTableProps = {
    bookings: Booking[];
    onBookingDeleted: (bookingId: string) => void;
    searchQuery: string;
}

export function BookingsTable({ bookings, onBookingDeleted, searchQuery }: BookingsTableProps) {
    const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const handleEditBooking = (bookingId: string) => {
        router.push(`/admin/edit-booking/${bookingId}`);
    };

    const handleDeleteBooking = async () => {
        if (!bookingToDelete) return;
        try {
            await deleteBooking(bookingToDelete);
            onBookingDeleted(bookingToDelete);
            toast({ title: "Booking Deleted", description: "The booking has been successfully deleted." });
        } catch (error) {
            console.error("Failed to delete booking:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to delete booking." });
        } finally {
            setBookingToDelete(null);
        }
    }

    if (bookings.length === 0) {
        return (
            <div className="h-24 text-center flex items-center justify-center">
                {searchQuery ? "No bookings match your search." : "No bookings found. Start by making a booking on the main site."}
            </div>
        )
    }

    return (
        <>
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
                                <div key={i} className="text-xs whitespace-nowrap">
                                    {p.name} ({p.age}, {p.gender}, {p.phone})
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
        </>
    )
}
