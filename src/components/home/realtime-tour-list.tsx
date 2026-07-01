"use client";

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { clientDb } from '@/lib/firebase-client';
import { TourCard } from './tour-card';
import type { TourPackage } from '@/types';

type RealtimeTourListProps = {
    initialPackages: TourPackage[];
    initialPrices: Record<string, number>;
}

export function RealtimeTourList({ initialPackages, initialPrices }: RealtimeTourListProps) {
    const [tourPackages, setTourPackages] = useState<TourPackage[]>(initialPackages);
    const [prices, setPrices] = useState<Record<string, number>>(initialPrices);

    useEffect(() => {
        // 1. Listen for real-time tour packages updates
        const packagesCol = collection(clientDb, 'tour_packages');
        const unsubscribePackages = onSnapshot(packagesCol, (snapshot) => {
            if (!snapshot.empty) {
                const packagesList = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id
                } as TourPackage));
                setTourPackages(packagesList);
            }
        }, (error) => {
            console.error("Error listening to real-time tour package updates:", error);
        });

        // 2. Listen for real-time price updates
        const pricesCol = collection(clientDb, 'packages');
        const unsubscribePrices = onSnapshot(pricesCol, (snapshot) => {
            const updatedPrices: Record<string, number> = { ...initialPrices };
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.slug && typeof data.price === 'number') {
                    updatedPrices[data.slug] = data.price;
                }
            });
            setPrices(updatedPrices);
        }, (error) => {
            console.error("Error listening to real-time price updates:", error);
        });

        return () => {
            unsubscribePackages();
            unsubscribePrices();
        };
    }, [initialPrices]);

    return (
        <div suppressHydrationWarning className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-1 md:grid-cols-2 lg:gap-12 w-full">
          {tourPackages.map((pkg) => (
            <TourCard
              key={pkg.id}
              pkg={pkg}
              price={prices[pkg.slug] !== undefined ? prices[pkg.slug] : pkg.price}
              loading={false}
            />
          ))}
        </div>
    );
}
