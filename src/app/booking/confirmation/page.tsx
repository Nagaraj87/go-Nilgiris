"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Download } from 'lucide-react';
import { tourPackages } from '@/lib/data';

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('bookingId');
    const packageSlug = searchParams.get('package');
    const tourPackage = tourPackages.find(p => p.slug === packageSlug);

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
                        <Button className="w-full" onClick={() => alert("PDF download is a demo feature.")}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Ticket
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
        <Suspense fallback={<div>Loading confirmation...</div>}>
            <ConfirmationContent />
        </Suspense>
    )
}
