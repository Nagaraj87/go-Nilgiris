
"use client";

import Image from 'next/image';
import type { GalleryImage } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ImageIcon } from 'lucide-react';

import Link from 'next/link';

type TourGalleryProps = {
    slug: string;
    images: GalleryImage[];
}

export function TourGallery({ slug, images }: TourGalleryProps) {

    if (!images || images.length === 0) {
        return (
            <Alert>
                <ImageIcon className="h-4 w-4" />
                <AlertTitle>Gallery Not Available</AlertTitle>
                <AlertDescription>
                    There are no images for this tour package yet. Please check back later!
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Carousel className="w-full">
            <CarouselContent>
                {images.map((image) => (
                    <CarouselItem key={image.id}>
                        <Card className="overflow-hidden">
                            <Link href={`/tours/${slug}/image/${image.id}`} passHref scroll={false} prefetch={false}>
                                <CardContent className="p-0 relative aspect-video cursor-pointer hover:opacity-90 transition-opacity">
                                    <Image
                                        src={image.url}
                                        alt={image.alt}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        unoptimized
                                        onError={(e) => e.currentTarget.src = 'https://picsum.photos/800/600'}
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 text-white">
                                        <p className="text-sm">{image.alt}</p>
                                    </div>
                                </CardContent>
                            </Link>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
            {images.length > 1 && <>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
            </>}
        </Carousel>
    )
}
