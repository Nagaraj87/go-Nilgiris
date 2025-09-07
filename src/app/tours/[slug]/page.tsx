
'use client';

import { notFound, useParams } from 'next/navigation';
import { tourPackages } from '@/lib/data';
import { TourHeader } from '@/components/tours/tour-header';
import { TourTabs } from '@/components/tours/tour-tabs';
import { TourBookingCard } from '@/components/tours/tour-booking-card';

export default function TourPackagePage() {
  const params = useParams();
  const slug = params.slug as string;
  const tourPackage = tourPackages.find((p) => p.slug === slug);

  if (!tourPackage) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div className="grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3">
          <TourHeader tourPackage={tourPackage} />
          <TourTabs tourPackage={tourPackage} />
        </div>

        <div className="lg:col-span-2">
            <div className="sticky top-24">
                <TourBookingCard tourPackage={tourPackage} />
            </div>
        </div>
      </div>
    </div>
  );
}
