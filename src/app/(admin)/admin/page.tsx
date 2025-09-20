
import { BookingsManagement } from "@/components/admin/bookings-management";
import { ContactManagement } from "@/components/admin/contact-management";
import { PriceManagement } from "@/components/admin/price-management";
import { GalleryManagement } from "@/components/admin/gallery-management";
import { TourManagement } from "@/components/admin/tour-management";


export default function AdminPage() {
  
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
      </div>
    </div>
  );
}
