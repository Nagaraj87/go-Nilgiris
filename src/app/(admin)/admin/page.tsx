
import { Suspense } from "react";
import { BookingsManagement } from "@/components/admin/bookings-management";
import { ContactManagement } from "@/components/admin/contact-management";
import { PriceManagement } from "@/components/admin/price-management";
import { GalleryManagement } from "@/components/admin/gallery-management";
import { TourManagement } from "@/components/admin/tour-management";
import { EmergencyManagement } from "@/components/admin/emergency-management";
import { Skeleton } from "@/components/ui/skeleton";


export default function AdminPage() {
  
  return (
    <div className="container mx-auto max-w-7xl py-12">
      <div className="space-y-12">
         <div id="emergency-management-section">
          <EmergencyManagement />
         </div>
         <div id="tour-management-section">
          <Suspense fallback={<Skeleton className="w-full h-[400px]" />}>
            <TourManagement />
          </Suspense>
        </div>
        <div id="bookings-section">
          <Suspense fallback={<Skeleton className="w-full h-[400px]" />}>
            <BookingsManagement />
          </Suspense>
        </div>
        <div id="gallery-section">
          <Suspense fallback={<Skeleton className="w-full h-[400px]" />}>
            <GalleryManagement />
          </Suspense>
        </div>
        <div id="contact-section">
          <Suspense fallback={<Skeleton className="w-full h-[400px]" />}>
            <ContactManagement />
          </Suspense>
        </div>
        <div id="pricing-section">
          <Suspense fallback={<Skeleton className="w-full h-[400px]" />}>
            <PriceManagement />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
