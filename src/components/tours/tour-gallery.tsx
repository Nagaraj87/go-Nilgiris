
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { GalleryImage, TourPackage } from '@/types';
import { getGalleryImages } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ImageIcon, AlertCircle, Loader2 } from 'lucide-react';


type TourGalleryProps = {
    slug: string;
    staticGallery: TourPackage['gallery'];
}

export function TourGallery({ slug, staticGallery }: TourGalleryProps) {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        
        const fetchGallery = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedImages = await getGalleryImages(slug);
                setImages(fetchedImages as GalleryImage[]);
            } catch (err) {
                console.error("Failed to fetch gallery images", err);
                setError("Gallery images could not be loaded. Showing default images.");
                // Fallback to static gallery
                setImages(staticGallery.map((g, i) => ({ ...g, id: `static-${i}`, url: g.src, packageSlug: slug })));
            } finally {
                setLoading(false);
            }
        };

        fetchGallery();
    }, [slug, staticGallery]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center w-full aspect-video rounded-lg bg-muted/50">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading Gallery...</p>
            </div>
        )
    }

    if (error && images.length === 0) {
        return (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Gallery Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    if (images.length === 0) {
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
                    <CardContent className="p-0 relative aspect-video">
                    <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={(e) => e.currentTarget.src = 'https://picsum.photos/800/600'}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 text-white">
                        <p className="text-sm">{image.alt}</p>
                    </div>
                    </CardContent>
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
