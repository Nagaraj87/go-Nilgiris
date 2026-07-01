
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { deleteGalleryImageFromFirestore } from '@/lib/firebase';
import type { GalleryImage } from '@/types';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type ImageGridProps = {
    images: GalleryImage[];
    onImageDeleted: (deletedImageId: string) => void;
};

export function ImageGrid({ images, onImageDeleted }: ImageGridProps) {
    const { toast } = useToast();
    const [imageToDelete, setImageToDelete] = useState<GalleryImage | null>(null);

    const handleDeleteImage = async () => {
        if (!imageToDelete) return;
        try {
            await deleteGalleryImageFromFirestore(imageToDelete.id);
            onImageDeleted(imageToDelete.id);
            toast({ title: "Image Deleted", description: "The image has been removed from the gallery." });
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Deletion Failed", description: "Could not delete the image." });
        } finally {
            setImageToDelete(null);
        }
    };

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map(image => (
                    <div key={image.id} className="relative group">
                        <Image
                            src={image.url}
                            alt={image.alt}
                            width={200}
                            height={150}
                            className="rounded-lg object-cover aspect-[4/3]"
                            unoptimized
                            onError={(e) => e.currentTarget.src = 'https://picsum.photos/200/150'} // Fallback
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="destructive" size="icon" onClick={() => setImageToDelete(image)}>
                                <Trash2 />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <AlertDialog open={!!imageToDelete} onOpenChange={(open) => !open && setImageToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this image?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The image link will be permanently deleted from the gallery. The original image will not be affected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setImageToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteImage} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
