
import type { LucideIcon } from 'lucide-react';

export type TourPackage = {
  id: string;
  slug: string;
  name: string;
  price: number;
  duration: string;
  overview: string;
  inclusions: string[];
  exclusions: string[];
  notes: string[];
  disclaimers: string[];
  itinerary: {
    time: string;
    activity: string;
    description: string;
    icon: LucideIcon;
  }[];
  gallery: {
    src: string;
    alt: string;
    hint: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
};

export type Booking = {
  id: string;
  bookingId: string;
  packageSlug: string;
  bookingDate: string;
  memberCount: number;
  totalAmount: number;
  passengers: { name: string; age: number; gender: string; phone: string }[];
  selectedSeats: { number: number; price: number }[];
};

export type GalleryImage = {
  id: string;
  url: string;
  alt: string;
  packageSlug: string;
};

export type ContactInfo = {
    whatsapp: string;
    call: string;
};

export type AdminCredentials = {
  username: string;
  password?: string;
};
