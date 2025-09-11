
import { notFound } from 'next/navigation';
import { TourHeader } from '@/components/tours/tour-header';
import { TourTabs } from '@/components/tours/tour-tabs';
import { TourBookingCard } from '@/components/tours/tour-booking-card';
import { getTourPackageBySlug, getTourPackages, getPackagePrice, getGalleryImages } from '@/lib/firebase';
import type { TourPackage } from '@/types';


async function getTourData(slug: string) {
    const tourData = await getTourPackageBySlug(slug);
    if (!tourData) {
        return { tourPackage: null, price: null, galleryImages: [] };
    }
    
    // Fetch price and gallery images in parallel
    const [price, galleryImages] = await Promise.all([
      getPackagePrice(slug),
      getGalleryImages(slug)
    ]);
    
    return { tourPackage: tourData, price, galleryImages };
}


export default async function TourPackagePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { tourPackage, price, galleryImages } = await getTourData(slug);

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
          <TourTabs tourPackage={tourPackage} galleryImages={galleryImages} />
        </div>

        <div className="lg:col-span-2">
            <div className="sticky top-24">
                <TourBookingCard tourPackageData={tourPackage} price={price} />
            </div>
        </div>
      </div>
    </div>
  );
}

// Generate static paths for all tour packages
export async function generateStaticParams() {
  const tourPackages = await getTourPackages();
  return tourPackages.map((pkg) => ({
    slug: pkg.slug,
  }));
}
