
"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Download, Loader2 } from 'lucide-react';
import { getTourPackageBySlug } from '@/lib/firebase';
import type { TourPackage } from '@/types';


function ConfirmationContent() {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('bookingId');
    const dbId = searchParams.get('id');
    const packageSlug = searchParams.get('package');
    const [tourPackage, setTourPackage] = useState<TourPackage | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(packageSlug) {
            getTourPackageBySlug(packageSlug).then(pkg => {
                setTourPackage(pkg);
                setLoading(false);
            })
        } else {
            setLoading(false);
        }
    }, [packageSlug]);

    if (loading) {
        return (
             <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-2xl py-12 md:py-24">
            <Card className="shadow-lg">
                <CardHeader className="items-center text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                    <CardTitle className="text-3xl font-headline">Booking Confirmed!</CardTitle>
                    <CardDescription>Your tour has been successfully booked. A confirmation has been sent to your email.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Your Booking ID is</p>
                        <p className="text-2xl font-bold text-primary">{bookingId}</p>
                    </div>
                    {tourPackage && (
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Tour Details</h3>
                            <p><strong>Package:</strong> {tourPackage.name}</p>
                            <div className="mt-4 border-t pt-4">
                                <h4 className="font-semibold">Assembly Point</h4>
                                <p className="text-sm text-muted-foreground">
                                    {tourPackage.itinerary[0].description} at <span className="font-bold text-primary">{tourPackage.itinerary[0].time}</span>.
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button asChild className="w-full">
                           <Link href={`/booking/ticket/${dbId}`} target="_blank">
                                <Download className="mr-2 h-4 w-4" />
                                Download Ticket
                           </Link>
                        </Button>
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/">Back to Home</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


export default function ConfirmationPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
            <ConfirmationContent />
        </Suspense>
    )
}
