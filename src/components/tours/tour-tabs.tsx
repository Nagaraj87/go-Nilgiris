
"use client";

import type { TourPackage, GalleryImage } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TourGallery } from "./tour-gallery";
import * as LucideIcons from 'lucide-react';
import { useMemo } from "react";


type TourTabsProps = {
    slug: string;
    tourPackage: TourPackage;
    galleryImages: GalleryImage[];
}

export function TourTabs({ slug, tourPackage, galleryImages }: TourTabsProps) {

    const hydratedItinerary = useMemo(() => {
        return tourPackage.itinerary.map(item => {
            const IconComponent = (item.iconName && LucideIcons[item.iconName as keyof typeof LucideIcons]) || LucideIcons.Bus;
            return {
                ...item,
                icon: IconComponent,
            };
        });
    }, [tourPackage.itinerary]);

    return (
        <Tabs defaultValue="itinerary" className="mt-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>
            <TabsContent value="itinerary" className="mt-6">
                <div className="relative pl-6">
                    <div className="absolute left-0 top-0 h-full w-0.5 bg-border -translate-x-1/2 ml-3"></div>
                    {hydratedItinerary.map((item, index) => (
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
               <TourGallery slug={slug} images={galleryImages} />
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
    )
}
