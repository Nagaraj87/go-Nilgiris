import { Modal } from '@/components/modal';
import Image from 'next/image';
import { getGalleryImages } from '@/lib/firebase';
import { notFound } from 'next/navigation';

export default async function PhotoModal({ params }: { params: Promise<{ slug: string, imageId: string }> }) {
  const { slug, imageId } = await params;
  const gallery = await getGalleryImages(slug);
  const image = gallery.find(img => img.id === imageId);

  if (!image) notFound();

  return (
    <Modal>
      <div className="relative aspect-video w-full bg-black flex flex-col justify-center items-center">
        <Image src={image.url} alt={image.alt} fill className="object-contain" unoptimized />
        <div className="absolute bottom-4 left-0 right-0 text-center">
            <span className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                {image.alt}
            </span>
        </div>
      </div>
    </Modal>
  );
}
