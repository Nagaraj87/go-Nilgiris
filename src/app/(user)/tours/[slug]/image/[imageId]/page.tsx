import Image from 'next/image';
import { getGalleryImages } from '@/lib/firebase';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function ImagePage({ params }: { params: Promise<{ slug: string, imageId: string }> }) {
  const { slug, imageId } = await params;
  const gallery = await getGalleryImages(slug);
  const image = gallery.find(img => img.id === imageId);

  if (!image) notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <Button asChild variant="outline" className="mb-8">
        <Link href={`/tours/${slug}`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Tour</Link>
      </Button>
      <div className="relative aspect-video w-full max-w-5xl mx-auto rounded-lg overflow-hidden border bg-black">
        <Image src={image.url} alt={image.alt} fill className="object-contain" unoptimized />
      </div>
      <p className="text-center mt-4 text-muted-foreground">{image.alt}</p>
    </div>
  );
}
