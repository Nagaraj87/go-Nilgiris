
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { tourPackages } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Check, Info, X, Image as ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getGalleryImages } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type GalleryImage = {
  id: string;
  url: string;
  alt: string;
  packageSlug: string;
};

export default function TourPackagePage() {
  const params = useParams();
  const slug = params.slug as string;
  const tourPackage = tourPackages.find((p) => p.slug === slug);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetchGallery = async () => {
      setLoadingGallery(true);
      try {
        const images = await getGalleryImages(slug);
        setGalleryImages(images as GalleryImage[]);
      } catch (error) {
        console.error("Failed to fetch gallery images", error);
        // Fallback to static data if firebase fails
        const staticPackage = tourPackages.find(p => p.slug === slug);
        if (staticPackage) {
           setGalleryImages(staticPackage.gallery.map((g, i) => ({ ...g, id: `static-${i}`, url: g.src, packageSlug: slug })));
        }
      } finally {
        setLoadingGallery(false);
      }
    };
    fetchGallery();
  }, [slug]);


  if (!tourPackage) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div className="grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3">
          <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary">{tourPackage.name}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{tourPackage.overview}</p>
          
          <div className="mt-6 bg-pink-50 border-l-4 border-pink-400 text-pink-800 p-4 rounded-r-lg" role="alert">
            <h3 className="font-bold flex items-center gap-2"><Info size={16}/> Important Notes</h3>
            {tourPackage.disclaimers.map((note, index) => (
              <p key={index} className="mt-2 text-sm">{note}</p>
            ))}
          </div>

          <Tabs defaultValue="itinerary" className="mt-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>
            <TabsContent value="itinerary" className="mt-6">
                <div className="relative pl-6">
                    <div className="absolute left-0 top-0 h-full w-0.5 bg-border -translate-x-1/2 ml-3"></div>
                    {tourPackage.itinerary.map((item, index) => (
                        <div key={index} className="relative mb-8">
                            <div className="absolute left-0 top-1.5 -translate-x-1/2 w-6 h-6 rounded-full bg-background flex items-center justify-center">
                                <item.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="pl-8">
                                <p className="font-bold text-primary">{item.time} - {item.activity}</p>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="gallery" className="mt-6">
               {loadingGallery ? (
                  <Skeleton className="w-full aspect-video rounded-lg" />
               ) : galleryImages.length > 0 ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {galleryImages.map((image) => (
                        <CarouselItem key={image.id}>
                          <Card className="overflow-hidden">
                            <CardContent className="p-0 relative aspect-video">
                              <Image
                                src={image.url}
                                alt={image.alt}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                              <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 text-white">
                                <p className="text-sm">{image.alt}</p>
                              </div>
                            </CardContent>
                          </Card>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {galleryImages.length > 1 && <>
                      <CarouselPrevious className="left-2" />
                      <CarouselNext className="right-2" />
                    </>}
                  </Carousel>
               ) : (
                  <Alert>
                    <ImageIcon className="h-4 w-4" />
                    <AlertTitle>Gallery Not Available</AlertTitle>
                    <AlertDescription>
                      There are no images in the gallery for this tour package yet. Please check back later!
                    </AlertDescription>
                  </Alert>
               )}
            </TabsContent>
            <TabsContent value="overview" className="mt-6">
              <Accordion type="single" collapsible className="w-full">
                {tourPackage.faqs.map((faq, index) => (
                   <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-2">
            <div className="sticky top-24">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Book Your Tour</CardTitle>
                        <p className="text-3xl font-bold text-primary">₹{tourPackage.price.toLocaleString('en-IN')} <span className="text-lg font-normal text-muted-foreground">onwards</span></p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">Inclusions</h4>
                            <ul className="space-y-2 text-sm">
                                {tourPackage.inclusions.map(item => <li key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600"/>{item}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Exclusions</h4>
                             <ul className="space-y-2 text-sm">
                                {tourPackage.exclusions.map(item => <li key={item} className="flex items-center gap-2"><X className="h-4 w-4 text-red-600"/>{item}</li>)}
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-semibold mb-2">Please Note</h4>
                             <ul className="space-y-2 text-sm">
                                {tourPackage.notes.map(item => <li key={item} className="flex items-start gap-2"><Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0"/>{item}</li>)}
                            </ul>
                        </div>
                        <Button asChild size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-base font-bold">
                            <Link href={`/booking?package=${tourPackage.slug}`}>Book Online</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
