
import Link from 'next/link';
import type { TourPackage } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2 } from 'lucide-react';

type TourCardProps = {
    pkg: TourPackage;
    price: number | null;
    loading: boolean;
}

export function TourCard({ pkg, price, loading }: TourCardProps) {
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
                    <Skeleton className="h-9 w-28 mt-1" />
                ) : (
                    <p className="text-3xl font-bold">
                        ₹{(price || pkg.price).toLocaleString('en-IN')} 
                        <span className="text-sm font-normal"> onwards</span>
                    </p>
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
                <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href={`/tours/${pkg.slug}`}>Book Now</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
