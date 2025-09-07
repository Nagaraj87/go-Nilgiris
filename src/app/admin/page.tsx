
"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import { deleteBooking, getBookings, addGalleryImageToFirestore, getGalleryImages, deleteGalleryImageFromFirestore } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GalleryHorizontal, Lock, Ticket, ArrowRight, MoreHorizontal, Pencil, Trash2, Image as ImageIcon, Link as LinkIcon, ShieldOff, Search } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { tourPackages } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

type Booking = {
  id: string;
  bookingId: string;
  packageSlug: string;
  bookingDate: string;
  memberCount: number;
  totalAmount: number;
  passengers: { name: string; age: number; gender: string }[];
  selectedSeats: { number: number; price: number }[];
};

type GalleryImage = {
  id: string;
  url: string;
  alt: string;
  packageSlug: string;
};


export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Gallery State
  const [gallerySelectedPackage, setGallerySelectedPackage] = useState<string>(tourPackages[0].slug);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<GalleryImage | null>(null);


  useEffect(() => {
    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        const bookingsData = await getBookings();
        setBookings(bookingsData as Booking[]);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to fetch bookings." });
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchBookings();
  }, [toast]);

  useEffect(() => {
    if (!gallerySelectedPackage) return;
    const fetchGallery = async () => {
      setLoadingGallery(true);
      try {
        const images = await getGalleryImages(gallerySelectedPackage);
        setGalleryImages(images as GalleryImage[]);
      } catch (error) {
        console.error("Failed to fetch gallery images", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to fetch gallery images." });
      } finally {
        setLoadingGallery(false);
      }
    }
    fetchGallery();
  }, [gallerySelectedPackage, toast]);


  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;
    try {
        await deleteBooking(bookingToDelete);
        setBookings(bookings.filter(b => b.id !== bookingToDelete));
        toast({ title: "Booking Deleted", description: "The booking has been successfully deleted." });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete booking." });
    } finally {
        setBookingToDelete(null);
    }
  }

  const handleEditBooking = (bookingId: string) => {
    router.push(`/admin/edit-booking/${bookingId}`);
  };

  const isValidImageUrl = (url: string) => {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  }

  const handleAddImage = async () => {
    if (!imageUrl || !imageAlt || !gallerySelectedPackage) {
        toast({ variant: "destructive", title: "Error", description: "Please provide an image URL and a description." });
        return;
    }
    if (!isValidImageUrl(imageUrl)) {
       toast({ variant: "destructive", title: "Invalid URL", description: "Please provide a valid image URL (e.g., .jpg, .png)." });
       return;
    }
    setIsAddingImage(true);

    try {
        const newImage = await addGalleryImageToFirestore(imageUrl, imageAlt, gallerySelectedPackage);
        setGalleryImages([...galleryImages, newImage as GalleryImage]);
        toast({ title: "Image Added", description: "The image has been added to the gallery." });
        setImageUrl("");
        setImageAlt("");
    } catch (dbError) {
         console.error("Firestore error:", dbError);
        toast({ variant: "destructive", title: "Add Failed", description: "Could not save image details to database." });
    } finally {
        setIsAddingImage(false);
    }
  }

  const handleDeleteImage = async () => {
    if(!imageToDelete) return;
    try {
        await deleteGalleryImageFromFirestore(imageToDelete.id);
        setGalleryImages(galleryImages.filter(img => img.id !== imageToDelete.id));
        toast({ title: "Image Deleted", description: "The image has been removed from the gallery."});
    } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Deletion Failed", description: "Could not delete the image." });
    } finally {
        setImageToDelete(null);
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const query = searchQuery.toLowerCase();
    return (
        booking.bookingId.toLowerCase().includes(query) ||
        booking.packageSlug.toLowerCase().includes(query) ||
        booking.passengers.some(p => p.name.toLowerCase().includes(query))
    );
  });


  return (
    <div className="container mx-auto max-w-7xl py-12">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="text-primary h-8 w-8"/>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
       <p className="text-muted-foreground mb-8">Manage your tours, view bookings, and update your site content.</p>
      
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="flex flex-col justify-between hover:border-primary transition-colors">
                 <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Manage Availability</CardTitle>
                         <div className="p-2 bg-muted rounded-full">
                            <ShieldOff className="w-6 h-6 text-muted-foreground" />
                        </div>
                    </div>
                    <CardDescription>
                        Block or unblock seats for specific tours and dates.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                     <Button asChild variant="outline" className="w-full">
                        <Link href="/admin/availability">
                           Manage Seats <ArrowRight className="ml-2"/>
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
             <Card className="flex flex-col justify-between hover:border-primary transition-colors">
                 <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Gallery Management</CardTitle>
                        <div className="p-2 bg-muted rounded-full">
                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                    </div>
                    <CardDescription>
                       Add or remove tour gallery images using URLs.
                    </CardDescription>
                </CardHeader>
                 <CardFooter>
                     <Button asChild variant="outline" className="w-full" onClick={() => document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth' })}>
                        <a href="#gallery-section">
                           Update Gallery <ArrowRight className="ml-2"/>
                        </a>
                    </Button>
                </CardFooter>
            </Card>
       </div>

       <div id="bookings-section" className="mb-12">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center mb-4">
                        <CardTitle>All Bookings</CardTitle>
                        <Badge variant="secondary">{filteredBookings.length} booking(s)</Badge>
                    </div>
                    <CardDescription>
                        View all tour bookings submitted through the booking form. Use the search below to filter results.
                    </CardDescription>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search by Booking ID, package, or passenger name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-full"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Booking ID</TableHead>
                            <TableHead>Tour Package</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Members</TableHead>
                            <TableHead>Total Amount</TableHead>
                            <TableHead>Seats</TableHead>
                            <TableHead>Passengers</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {loadingBookings ? (
                            Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={`skel-book-${i}`}>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                            </TableRow>
                            ))
                        ) : filteredBookings.length > 0 ? (
                            filteredBookings.map((booking) => (
                            <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.bookingId}</TableCell>
                            <TableCell>{booking.packageSlug}</TableCell>
                            <TableCell>{format(new Date(booking.bookingDate), "PPP")}</TableCell>
                            <TableCell>{booking.memberCount}</TableCell>
                            <TableCell>₹{booking.totalAmount.toLocaleString('en-IN')}</TableCell>
                            <TableCell>{booking.selectedSeats.map(s => s.number).join(', ')}</TableCell>
                            <TableCell>
                                {booking.passengers.map((p, i) => (
                                <div key={i} className="text-xs">
                                    {p.name} ({p.age}, {p.gender})
                                </div>
                                ))}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditBooking(booking.id)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setBookingToDelete(booking.id)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                            </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                  {searchQuery ? "No bookings match your search." : "No bookings found. Start by making a booking on the main site."}
                                </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
            </Card>
       </div>

       <div id="gallery-section">
             <Card>
                <CardHeader>
                    <CardTitle>Gallery Management</CardTitle>
                    <CardDescription>Add or delete images for your tour packages using direct image URLs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                         <Select value={gallerySelectedPackage} onValueChange={setGallerySelectedPackage}>
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

                    <div className="p-4 border-dashed border-2 rounded-lg space-y-4">
                        <h3 className="font-semibold text-lg">Add New Image</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input placeholder="Enter Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} disabled={isAddingImage}/>
                            <Input placeholder="Image description (for accessibility)" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} disabled={isAddingImage}/>
                        </div>
                        <Button onClick={handleAddImage} disabled={isAddingImage || !imageUrl || !imageAlt}>
                            <LinkIcon className="mr-2"/> Add Image
                        </Button>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Current Gallery</h3>
                        {loadingGallery ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={`skel-img-${i}`} className="rounded-lg object-cover aspect-[4/3]" />
                                ))}
                            </div>
                        ) : galleryImages.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {galleryImages.map(image => (
                                    <div key={image.id} className="relative group">
                                        <Image src={image.url} alt={image.alt} width={200} height={150} className="rounded-lg object-cover aspect-[4/3]" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button variant="destructive" size="icon" onClick={() => setImageToDelete(image)}>
                                                <Trash2 />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <Alert>
                                <ImageIcon className="h-4 w-4" />
                                <AlertTitle>No Images Found</AlertTitle>
                                <AlertDescription>
                                  There are no images in the gallery for this tour package. Add one using the form above.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </CardContent>
            </Card>
       </div>

      <AlertDialog open={!!bookingToDelete} onOpenChange={(open) => !open && setBookingToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the booking and release the seats.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setBookingToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteBooking} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
    </div>
  );

    

    
