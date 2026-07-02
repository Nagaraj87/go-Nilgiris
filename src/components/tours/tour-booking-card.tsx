
"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Info, Loader2, Gift } from 'lucide-react';
import type { TourPackage } from "@/types";
import React from 'react';
import { useLoading } from '@/components/loading-provider';

type TourBookingCardProps = {
    tourPackageData: TourPackage;
    price: number | null;
}

export function TourBookingCard({ tourPackageData, price }: TourBookingCardProps) {
    const loadingPrice = price === null;
    const { showLoader } = useLoading();

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Book Your Tour</CardTitle>
                {loadingPrice ? (
                    <div className="flex items-center gap-2 mt-1">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-lg text-muted-foreground">Finding best price...</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-3xl font-bold text-primary">
                                ₹{(price !== null ? price : (tourPackageData.discount ? Math.round(tourPackageData.price * (1 - tourPackageData.discount / 100)) : tourPackageData.price)).toLocaleString('en-IN')}
                            </span>
                            {tourPackageData.discount !== undefined && tourPackageData.discount > 0 && (
                                <>
                                    <span className="text-lg text-muted-foreground line-through">
                                        ₹{tourPackageData.price.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-sm font-semibold text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
                                        {tourPackageData.discount}% OFF
                                    </span>
                                </>
                            )}
                        </div>
                        <span className="text-sm font-normal text-muted-foreground">onwards</span>
                        {tourPackageData.gift && (
                            <div className="flex items-center gap-2.5 mt-3 p-3 bg-accent/10 border border-accent/25 rounded-lg text-accent-foreground text-xs font-semibold animate-pulse">
                                <Gift className="h-5 w-5 text-accent shrink-0" />
                                <div>
                                    <span className="block text-[10px] uppercase tracking-wider text-accent-foreground/70 font-bold">Seasonal Gift Offer</span>
                                    <span className="text-sm font-bold text-foreground">{tourPackageData.gift}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-semibold mb-2">Inclusions</h4>
                    <ul className="space-y-2 text-sm">
                        {tourPackageData.inclusions.map(item => <li key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />{item}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Exclusions</h4>
                    <ul className="space-y-2 text-sm">
                        {tourPackageData.exclusions.map(item => <li key={item} className="flex items-center gap-2"><X className="h-4 w-4 text-red-600" />{item}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Please Note</h4>
                    <ul className="space-y-2 text-sm">
                        {tourPackageData.notes.map(item => <li key={item} className="flex items-start gap-2"><Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />{item}</li>)}
                    </ul>
                </div>
                <Button asChild size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-base font-bold" disabled={loadingPrice} onClick={() => showLoader()}>
                    <Link href={`/booking?package=${tourPackageData.slug}`} prefetch={false}>
                        {loadingPrice ? <Loader2 className="animate-spin" /> : "Book Online"}
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}
