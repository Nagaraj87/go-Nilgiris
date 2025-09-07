
"use client";

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { addGalleryImageToFirestore } from '@/lib/firebase';
import type { GalleryImage } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, Loader2 } from 'lucide-react';

type AddImageFormProps = {
    packageSlug: string;
    onImageAdded: (newImage: GalleryImage) => void;
};

export function AddImageForm({ packageSlug, onImageAdded }: AddImageFormProps) {
    const { toast } = useToast();
    const [imageUrl, setImageUrl] = useState("");
    const [imageAlt, setImageAlt] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const isValidImageUrl = (url: string) => {
        try {
            new URL(url);
            return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
        } catch (_) {
            return false;
        }
    }

    const handleAddImage = async () => {
        if (!imageUrl || !imageAlt) {
            toast({ variant: "destructive", title: "Error", description: "Please provide an image URL and a description." });
            return;
        }
        if (!isValidImageUrl(imageUrl)) {
            toast({ variant: "destructive", title: "Invalid URL", description: "Please provide a valid image URL (e.g., .jpg, .png)." });
            return;
        }
        setIsAdding(true);

        try {
            const newImage = await addGalleryImageToFirestore(imageUrl, imageAlt, packageSlug);
            onImageAdded(newImage as GalleryImage);
            toast({ title: "Image Added", description: "The image has been added to the gallery." });
            setImageUrl("");
            setImageAlt("");
        } catch (dbError) {
            console.error("Firestore error:", dbError);
            toast({ variant: "destructive", title: "Add Failed", description: "Could not save image details to the database." });
        } finally {
            setIsAdding(false);
        }
    }

    return (
        <div className="p-4 border-dashed border-2 rounded-lg space-y-4">
            <h3 className="font-semibold text-lg">Add New Image</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                    placeholder="Enter Image URL" 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)} 
                    disabled={isAdding} 
                />
                <Input 
                    placeholder="Image description (for accessibility)" 
                    value={imageAlt} 
                    onChange={(e) => setImageAlt(e.target.value)} 
                    disabled={isAdding} 
                />
            </div>
            <Button onClick={handleAddImage} disabled={isAdding || !imageUrl || !imageAlt}>
                {isAdding ? <Loader2 className="animate-spin" /> : <LinkIcon />}
                Add Image
            </Button>
        </div>
    );
}
