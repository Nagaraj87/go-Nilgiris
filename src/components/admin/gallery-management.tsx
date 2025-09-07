
"use client";

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ImageIcon } from 'lucide-react';
import { tourPackages } from '@/lib/data';
import type { GalleryImage } from '@/types';
import { getGalleryImages } from '@/lib/firebase';
import { AddImageForm } from './add-image-form';
import { ImageGrid } from './image-grid';

export function GalleryManagement() {
    const { toast } = useToast();
    const [selectedPackage, setSelectedPackage] = useState<string>(tourPackages[0].slug);
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedPackage) return;
        const fetchGallery = async () => {
            setLoading(true);
            setError(null);
            try {
                const images = await getGalleryImages(selectedPackage);
                setGalleryImages(images as GalleryImage[]);
            } catch (err) {
                console.error("Failed to fetch gallery images", err);
                setError("Failed to fetch gallery images. Please select another package or try again.");
            } finally {
                setLoading(false);
            }
        }
        fetchGallery();
    }, [selectedPackage]);

    const handleImageAdded = (newImage: GalleryImage) => {
        setGalleryImages(prev => [...prev, newImage]);
    };

    const handleImageDeleted = (deletedImageId: string) => {
        setGalleryImages(prev => prev.filter(img => img.id !== deletedImageId));
    };

    const renderContent = () => {
        if (loading) {
            return (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={`skel-img-${i}`} className="rounded-lg object-cover aspect-[4/3]" />
                    ))}
                </div>
            )
        }
        if (error) {
            return (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
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
