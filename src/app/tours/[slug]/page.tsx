
import { notFound } from 'next/navigation';
import { TourHeader } from '@/components/tours/tour-header';
import { TourTabs } from '@/components/tours/tour-tabs';
import { TourBookingCard } from '@/components/tours/tour-booking-card';
import { getTourPackageBySlug } from '@/lib/firebase';
import type { TourPackage } from '@/types';
import { tourPackages } from '@/lib/data';


async function getTourData(slug: string): Promise<Omit<TourPackage, 'itinerary'> & { itinerary: Omit<TourPackage['itinerary'][0], 'icon'>[] } | null> {
    const tourData = await getTourPackageBySlug(slug);
    if (!tourData) {
        return null;
    }
    return tourData;
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
          <TourHeader 
            name={tourPackage.name} 
            overview={tourPackage.overview} 
            disclaimers={tourPackage.disclaimers} 
           />
          <TourTabs tourPackage={tourPackage} />
        </div>

        <div className="lg:col-span-2">
            <div className="sticky top-24">
                <TourBookingCard tourPackageData={tourPackage} />
            </div>
        </div>
      </div>
    </div>
  );
}

// Generate static paths for all tour packages
export async function generateStaticParams() {
  // Reading from static data for build-time generation
  return tourPackages.map((pkg) => ({
    slug: pkg.slug,
  }));
}
