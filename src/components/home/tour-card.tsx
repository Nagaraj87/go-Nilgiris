"use client";

import Link from 'next/link';
import { useLoading } from '@/components/loading-provider';
import type { TourPackage } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2, Gift } from 'lucide-react';

type TourCardProps = {
    pkg: TourPackage;
    price: number | null;
    loading?: boolean; // Made optional
}

export function TourCard({ pkg, price, loading }: TourCardProps) {
    const { showLoader } = useLoading();

    return (
         <Card key={pkg.id} className="w-full transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary">{pkg.name}</CardTitle>
                <CardDescription>{pkg.overview}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div>
                <p className="text-sm text-muted-foreground">Overall {pkg.duration} trip</p>
                {loading ? (
                    <div className="flex items-center gap-2 mt-1">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-muted-foreground">Loading price...</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-3xl font-bold">
                                ₹{(price !== null ? price : (pkg.discount ? Math.round(pkg.price * (1 - pkg.discount / 100)) : pkg.price)).toLocaleString('en-IN')}
                            </span>
                            {pkg.discount !== undefined && pkg.discount > 0 && (
                                <>
                                    <span className="text-lg text-muted-foreground line-through">
                                        ₹{pkg.price.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
                                        {pkg.discount}% OFF
                                    </span>
                                </>
                            )}
                        </div>
                        <span className="text-xs text-muted-foreground">onwards</span>
                        {pkg.gift && (
                            <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-accent/15 border border-accent/30 rounded-md text-accent-foreground text-xs font-semibold w-fit animate-pulse">
                              <Gift className="w-3.5 h-3.5 text-accent shrink-0" />
                              <span>Free Seasonal Gift: {pkg.gift}</span>
                            </div>
                        )}
                    </div>
                )}
                </div>
                <ul className="grid gap-2 text-sm">
                {pkg.inclusions.slice(0, 2).map((item) => (
                    <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                    </li>
                ))}
                    <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>And more...</span>
                    </li>
                </ul>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => showLoader()}>
                <Link href={`/tours/${pkg.slug}`}>Book Now</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
