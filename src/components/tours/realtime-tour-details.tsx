"use client";

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { clientDb } from '@/lib/firebase-client';
import { TourHeader } from './tour-header';
import { TourTabs } from './tour-tabs';
import { TourBookingCard } from './tour-booking-card';
import type { TourPackage, GalleryImage } from '@/types';

type RealtimeTourDetailsProps = {
    initialTourPackage: TourPackage;
    initialPrice: number | null;
    initialGalleryImages: GalleryImage[];
    slug: string;
}

export function RealtimeTourDetails({ 
    initialTourPackage, 
    initialPrice, 
    initialGalleryImages, 
    slug 
}: RealtimeTourDetailsProps) {
    const [tourPackage, setTourPackage] = useState<TourPackage>(initialTourPackage);
    const [price, setPrice] = useState<number | null>(initialPrice);

    useEffect(() => {
        if (!slug) return;

        // 1. Listen for real-time updates to the specific tour package details
        const packageDocRef = doc(clientDb, 'tour_packages', slug);
        const unsubscribePkg = onSnapshot(packageDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setTourPackage({
                    ...docSnap.data(),
                    id: docSnap.id
                } as TourPackage);
            }
        }, (error) => {
            console.error("Error listening to tour package details:", error);
        });

        // 2. Listen for real-time updates to the package price
        const priceDocRef = doc(clientDb, 'packages', slug);
        const unsubscribePrice = onSnapshot(priceDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (typeof data.price === 'number') {
                    setPrice(data.price);
                }
            }
        }, (error) => {
            console.error("Error listening to tour price updates:", error);
        });

        return () => {
            unsubscribePkg();
            unsubscribePrice();
        };
    }, [slug]);

    return (
        <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3">
                <TourHeader 
                    name={tourPackage.name} 
                    overview={tourPackage.overview} 
                    disclaimers={tourPackage.disclaimers} 
                />
                <TourTabs slug={slug} tourPackage={tourPackage} galleryImages={initialGalleryImages} />
            </div>

            <div className="lg:col-span-2">
                <div className="sticky top-24">
                    <TourBookingCard tourPackageData={tourPackage} price={price} />
                </div>
            </div>
        </div>
    );
}
