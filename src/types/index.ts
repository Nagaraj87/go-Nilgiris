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
