
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { TourHeader } from '@/components/tours/tour-header';
import { TourTabs } from '@/components/tours/tour-tabs';
import { TourBookingCard } from '@/components/tours/tour-booking-card';
import { getTourPackageBySlug, getTourPackages, getPackagePrice, getGalleryImages } from '@/lib/firebase';
import type { TourPackage } from '@/types';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tourPackage = await getTourPackageBySlug(slug);

  if (!tourPackage) {
    return {
      title: 'Tour Not Found',
      description: 'The tour you are looking for does not exist.',
    }
  }

  return {
    title: `${tourPackage.name} | Go Nilgris`,
    description: tourPackage.overview,
  }
}

async function TourTabsWrapper({ slug, tourPackage }: { slug: string, tourPackage: TourPackage }) {
  const galleryImages = await getGalleryImages(slug);
  return <TourTabs slug={slug} tourPackage={tourPackage} galleryImages={galleryImages} />;
}

async function BookingCardWrapper({ slug, tourPackage }: { slug: string, tourPackage: TourPackage }) {
  const price = await getPackagePrice(slug);
  return <TourBookingCard tourPackageData={tourPackage} price={price} />;
}


export default async function TourPackagePage({ params }: Props) {
  const { slug } = await params;
  const tourPackage = await getTourPackageBySlug(slug);

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
          <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg mt-8" />}>
            <TourTabsWrapper slug={slug} tourPackage={tourPackage} />
          </Suspense>
        </div>

        <div className="lg:col-span-2">
            <div className="sticky top-24">
                <Suspense fallback={<TourBookingCard tourPackageData={tourPackage} price={null} />}>
                  <BookingCardWrapper slug={slug} tourPackage={tourPackage} />
                </Suspense>
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
