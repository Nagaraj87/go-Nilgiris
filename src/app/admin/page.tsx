
import { Lock, GalleryHorizontal, Tag, Phone, ShieldOff, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingsManagement } from "@/components/admin/bookings-management";
import { ContactManagement } from "@/components/admin/contact-management";
import { PriceManagement } from "@/components/admin/price-management";
import { GalleryManagement } from "@/components/admin/gallery-management";
import Link from "next/link";


export default function AdminPage() {
  
  const scrollTo = (id: string) => {
    // This needs to be a client component to work, but for now we keep it server-side
    // and this function will not be used until refactored.
    // document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="container mx-auto max-w-7xl py-12">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
            <Lock className="text-primary h-8 w-8"/>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
      </div>
       <p className="text-muted-foreground mb-8">Manage your tours, view bookings, and update your site content.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="flex flex-col justify-between hover:border-primary transition-colors">
                 <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Availability</CardTitle>
                         <div className="p-2 bg-muted rounded-full">
                            <ShieldOff className="w-6 h-6 text-muted-foreground" />
                        </div>
                    </div>
                    <CardDescription>
                        Manually block seats for maintenance or reservations.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                     <Button asChild variant="outline" className="w-full">
                        <Link href={`/admin/availability`}>
                           Manage Seats <ArrowRight className="ml-2"/>
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
             <Card className="flex flex-col justify-between hover:border-primary transition-colors">
                 <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Pricing</CardTitle>
                         <div className="p-2 bg-muted rounded-full">
                            <Tag className="w-6 h-6 text-muted-foreground" />
                        </div>
                    </div>
                    <CardDescription>
                        Update the base price for each tour.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                     <Button asChild variant="outline" className="w-full" >
                        <a href="#pricing-section">
                           Update Prices <ArrowRight className="ml-2"/>
                        </a>
                    </Button>
                </CardFooter>
            </Card>
             <Card className="flex flex-col justify-between hoverborder-primary transition-colors">
                 <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Contact</CardTitle>
                         <div className="p-2 bg-muted rounded-full">
                            <Phone className="w-6 h-6 text-muted-foreground" />
                        </div>
                    </div>
                    <CardDescription>
                        Update customer support numbers.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                     <Button asChild variant="outline" className="w-full" >
                        <a href="#contact-section">
                           Update Contact <ArrowRight className="ml-2"/>
                        </a>
                    </Button>
                </CardFooter>
            </Card>
       </div>

      <div className="space-y-12">
        <div id="bookings-section">
          <BookingsManagement />
        </div>
        <div id="gallery-section">
          <GalleryManagement />
        </div>
        <div id="contact-section">
          <ContactManagement />
        </div>
        <div id="pricing-section">
          <PriceManagement />
        </div>
      </div>
    </div>
  );
}
