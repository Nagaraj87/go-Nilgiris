
import { notFound } from 'next/navigation';
import { RealtimeTourDetails } from '@/components/tours/realtime-tour-details';
import { getTourPackageBySlug, getPackagePrice, getGalleryImages } from '@/lib/firebase';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

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

export default async function TourPackagePage({ params }: Props) {
  const { slug } = await params;

  const [tourPackage, price, galleryImages] = await Promise.all([
    getTourPackageBySlug(slug),
    getPackagePrice(slug).catch(() => null),
    getGalleryImages(slug).catch(() => [])
  ]);

  if (!tourPackage) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <RealtimeTourDetails
        initialTourPackage={tourPackage}
        initialPrice={price}
        initialGalleryImages={galleryImages}
        slug={slug}
      />
    </div>
  );
}



