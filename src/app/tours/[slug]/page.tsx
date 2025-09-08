
import { notFound } from 'next/navigation';
import { tourPackages as staticTourPackages } from '@/lib/data';
import { TourHeader } from '@/components/tours/tour-header';
import { TourTabs } from '@/components/tours/tour-tabs';
import { TourBookingCard } from '@/components/tours/tour-booking-card';
import { getTourPackageBySlug } from '@/lib/firebase';
import type { TourPackage } from '@/types';
import * as LucideIcons from 'lucide-react';


async function getTourData(slug: string): Promise<TourPackage | null> {
    const tourData = await getTourPackageBySlug(slug);
    if (!tourData) {
        return null;
    }

    // Re-hydrate the icon components
    const hydratedItinerary = tourData.itinerary.map(item => {
        const IconComponent = LucideIcons[item.iconName as keyof typeof LucideIcons] || LucideIcons.HelpCircle;
        return {
            ...item,
            icon: IconComponent,
        };
    });

    return {
        ...tourData,
        itinerary: hydratedItinerary,
    } as TourPackage;
}


export default async function TourPackagePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const tourPackage = await getTourData(slug);

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

// Generate static paths for all tour packages
export async function generateStaticParams() {
  return staticTourPackages.map((pkg) => ({
    slug: pkg.slug,
  }));
}
