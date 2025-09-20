

"use client";

import { useState, useEffect, useTransition } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ImageIcon, Loader2 } from 'lucide-react';
import type { GalleryImage, TourPackage } from '@/types';
import { getGalleryImages, getTourPackages } from '@/lib/firebase';
import { AddImageForm } from './add-image-form';
import { ImageGrid } from './image-grid';

export function GalleryManagement() {
    const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<string>('');
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingTours, setLoadingTours] = useState(true);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        getTourPackages().then(packages => {
            setTourPackages(packages);
            if (packages.length > 0) {
                setSelectedPackage(packages[0].slug);
            }
            setLoadingTours(false);
        });
    }, []);

    useEffect(() => {
        if (!selectedPackage) return;
        
        startTransition(async () => {
            setLoading(true);
            const images = await getGalleryImages(selectedPackage);
            setGalleryImages(images as GalleryImage[]);
            setLoading(false);
        });

    }, [selectedPackage]);

    const handleImageAdded = (newImage: GalleryImage) => {
        setGalleryImages(prev => [...prev, newImage]);
    };

    const handleImageDeleted = (deletedImageId: string) => {
        setGalleryImages(prev => prev.filter(img => img.id !== deletedImageId));
    };

    const renderContent = () => {
        if (loading || isPending) {
            return (
                 <div className="flex items-center justify-center h-48">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Loading gallery...</span>
                    </div>
                </div>
            )
        }
        if (galleryImages.length > 0) {
            return <ImageGrid images={galleryImages} onImageDeleted={handleImageDeleted} />
        }
        return (
             <Alert>
                <ImageIcon className="h-4 w-4" />
                <AlertTitle>No Images Found</AlertTitle>
                <AlertDescription>
                    There are no images in the gallery for this tour package. Add one using the form above.
                </AlertDescription>
            </Alert>
        )
    }

    if (loadingTours) {
        return <Card><CardHeader><CardTitle>Loading...</CardTitle></CardHeader></Card>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gallery Management</CardTitle>
                <CardDescription>Add or delete images for your tour packages using direct image URLs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                        <SelectTrigger className="w-full md:w-1/3">
                            <SelectValue placeholder="Select a package" />
                        </SelectTrigger>
                        <SelectContent>
                            {tourPackages.map(pkg => (
                                <SelectItem key={pkg.slug} value={pkg.slug}>{pkg.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <AddImageForm packageSlug={selectedPackage} onImageAdded={handleImageAdded} />

                <div>
                    <h3 className="font-semibold text-lg mb-4">Current Gallery for "{tourPackages.find(p=>p.slug === selectedPackage)?.name}"</h3>
                    {renderContent()}
                </div>
            </CardContent>
        </Card>
    );
}
