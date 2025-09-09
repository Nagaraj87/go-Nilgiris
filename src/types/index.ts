
export type ItineraryItem = {
    time: string;
    activity: string;
    description: string;
    iconName?: string;
};

export type FAQ = {
    question: string;
    answer: string;
};

export type GalleryItem = {
    src: string;
    alt: string;
    hint: string;
};

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
  itinerary: ItineraryItem[];
  gallery: GalleryItem[];
  faqs: FAQ[];
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
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
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
