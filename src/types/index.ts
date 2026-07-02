
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



export interface TourPackage {
  id: string;
  slug: string;
  name: string;
  price: number;
  discount?: number;
  duration: string;
  overview: string;
  inclusions: string[];
  exclusions: string[];
  notes: string[];
  disclaimers: string[];
  itinerary: ItineraryItem[];
  faqs: FAQ[];
};

type Passenger = {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'child';
  phone: string;
  isForeign?: boolean;
  email?: string;
}

type SeatSelection = {
  number: number;
  price: number;
}

export type Booking = {
  id: string;
  bookingId: string;
  packageSlug: string;
  bookingDate: string; // Stored as "yyyy-MM-dd"
  memberCount: number;
  totalAmount: number;
  passengers: Passenger[];
  selectedSeats: SeatSelection[];
  paymentStatus?: 'PENDING' | 'COMPLETED' | 'FAILED';
  phonePeTransactionId?: string;
};

export type GalleryImage = {
  id: string;
  url: string;
  alt: string;
  packageSlug: string;
  createdAt: string; // Changed to string to be serializable
};

export type ContactInfo = {
  whatsapp: string;
  call: string;
};

export type AdminCredentials = {
  username: string;
  password?: string; // Password is a hash, and optional when updating only username
};

