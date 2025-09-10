

import { Lock, GalleryHorizontal, Tag, Phone, ShieldOff, ArrowRight, Plane, LogOut } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingsManagement } from "@/components/admin/bookings-management";
import { ContactManagement } from "@/components/admin/contact-management";
import { PriceManagement } from "@/components/admin/price-management";
import { GalleryManagement } from "@/components/admin/gallery-management";
import Link from "next/link";
import { TourManagement } from "@/components/admin/tour-management";
import { CredentialsManagement } from "@/components/admin/credentials-management";


export default function AdminPage() {
  
  const scrollTo = (id: string) => {
    // This needs to be a client component to work, but for now we keep it server-side
    // and this function will not be used until refactored.
    // document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="container mx-auto max-w-7xl py-12">
      <div className="space-y-12">
         <div id="tour-management-section">
          <TourManagement />
        </div>
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
         <div id="credentials-section">
          <CredentialsManagement />
        </div>
      </div>
    </div>
  );
}
