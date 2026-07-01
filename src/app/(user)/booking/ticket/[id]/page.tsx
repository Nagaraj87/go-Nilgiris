
import { getBookingById, getTourPackageBySlug } from '@/lib/firebase';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeerLogo } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { TicketPrint } from '@/app/booking/ticket/[id]/ticket-print';
import type { Booking, TourPackage } from '@/types';


async function getTicketData(id: string) {
    const booking = await getBookingById(id);
    if (!booking) {
        return { booking: null, tourPackage: null };
    }
    const tourPackage = await getTourPackageBySlug(booking.packageSlug);
    return { booking, tourPackage };
}


export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const { booking, tourPackage } = await getTicketData(resolvedParams.id);

    if (!booking || !tourPackage) {
        notFound();
    }

    return (
        <div className="bg-muted print:bg-white">
            <div className="container mx-auto max-w-3xl py-12">
                <div className="flex justify-end mb-4 print:hidden">
                    <TicketPrint />
                </div>
                <Card id="ticketContent" className="p-4 sm:p-8 shadow-2xl print:shadow-none print:p-0">
                    <CardHeader className="text-center p-0 sm:p-6">
                        <div className="flex justify-between items-start">
                            <div className="text-left">
                                <div className="flex items-center gap-2">
                                    <DeerLogo className="h-8 w-8 text-primary" />
                                    <span className="text-xl font-bold">Go Nilgris</span>
                                </div>
                                <p className="text-xs text-muted-foreground">A GoNilgris Tourism Venture</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg text-primary">E-TICKET</p>
                                <p className="text-sm">Booking ID: <span className="font-mono">{booking.bookingId}</span></p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6">
                        <Separator className="my-6" />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                            <div>
                                <p className="text-muted-foreground">Tour Package</p>
                                <p className="font-bold">{tourPackage.name}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Travel Date</p>
                                <p className="font-bold">{format(new Date(booking.bookingDate), 'PPP')}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Total Paid</p>
                                <p className="font-bold">₹{booking.totalAmount.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                        <Separator className="my-6" />
                        <div>
                            <h3 className="font-bold mb-4 text-lg">Passenger Details ({booking.memberCount})</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                                {booking.passengers.map((p, i) => (
                                    <div key={i} className="p-2 border rounded-md bg-muted/50">
                                        <p className="font-semibold">{p.name}</p>
                                        <p className="text-muted-foreground">Age: {p.age} | Gender: {p.gender}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Separator className="my-6" />
                        <div>
                            <h3 className="font-bold mb-2 text-lg">Seat Information</h3>
                            <p>Your selected seat numbers are: <span className="font-bold text-primary text-xl">{booking.selectedSeats.map(s => s.number).join(', ')}</span></p>
                            <p className="text-xs text-muted-foreground mt-1">Seating is on a first-come, first-served basis within the group. The seat number is for reference.</p>
                        </div>
                        <Separator className="my-6" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-bold mb-2 text-lg">Assembly Point</h3>
                                <div className="text-sm space-y-1">
                                    <p><strong>Time:</strong> <span className="text-primary font-semibold">{tourPackage.itinerary[0].time}</span></p>
                                    <p><strong>Location:</strong> {tourPackage.itinerary[0].description}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold mb-2 text-lg">Support</h3>
                                <p className="text-sm">For any questions, reach out to us at <a href="mailto:lets@gokotagiri.com" className="text-primary underline">lets@gokotagiri.com</a></p>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
