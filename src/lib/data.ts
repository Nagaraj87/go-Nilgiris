
import type { TourPackage } from '@/types';
import { Bus, Camera, Car, Sailboat, PawPrint, FerrisWheel, Flower2, Mountain, Search, ShoppingCart, Sunset, Trees, Utensils, Wind } from 'lucide-react';

export const tourPackages: TourPackage[] = [
  {
    id: '1',
    slug: 'ooty-coonoor-tour',
    name: 'Ooty-Coonoor Tour',
    price: 349,
    duration: '9 Hours',
    overview: 'A scenic 9-hour trip covering the best of Ooty and Coonoor. Enjoy breathtaking views, lush tea estates, and beautiful gardens. Pickup and drop from Ooty included.',
    inclusions: ['Pickup/Drop from Ooty', '9 hours trip', 'All parking & transport included', 'Guide included'],
    exclusions: ['Entrance tickets not included', 'No foods included'],
    notes: [
      'Kids above 2 years will be charged.',
      'Doorstep pickup/drop at additional cost*.',
    ],
    disclaimers: [
      "The seat layout mentioned on the next step is just for booking reference. Mostly we will not stick to the seat numbers as it is a group bus tour concept.",
      "We might sometime not be able to visit all the places in one day as mentioned in the plan due to traffic, customer delay at any sightseeing place, etc. But we will guide and try to make it possible!"
    ],
    itinerary: [
      { time: '8:00 AM', activity: 'Assembly Point', description: 'Assemble at GoKotagiri Lounge near Pandian Park, Kotagiri.', icon: Bus, iconName: 'Bus' },
      { time: '8:30 AM', activity: 'Depart Ooty', description: 'Start our journey towards the beautiful hills.', icon: Car, iconName: 'Car' },
      { time: '9:00 AM', activity: 'Doddabetta Peak', description: 'Visit the highest vantage point in the Nilgiris for panoramic views (1 hour).', icon: Mountain, iconName: 'Mountain' },
      { time: '11:00 AM', activity: 'Tea Estate Visit', description: 'Explore a lush tea garden and learn about tea processing (30 min).', icon: Flower2, iconName: 'Flower2' },
      { time: '12:00 PM', activity: 'Lunch Break', description: 'Break for lunch at a local restaurant (cost not included).', icon: Utensils, iconName: 'Utensils' },
      { time: '1:30 PM', activity: 'Botanical Gardens', description: 'Stroll through the vast and historic Ooty Botanical Gardens (1.5 hours).', icon: Trees, iconName: 'Trees' },
      { time: '3:30 PM', activity: 'Coonoor Lamb\'s Rock', description: 'Enjoy stunning views of the Coimbatore plains from this viewpoint (45 min).', icon: Sunset, iconName: 'Sunset' },
      { time: '6:00 PM', activity: 'Return to Ooty', description: 'Arrive back at the drop-off point in Ooty.', icon: Bus, iconName: 'Bus' },
    ],
    gallery: [
      { src: 'https://picsum.photos/800/600?random=1', alt: 'Breathtaking views from Doddabetta', hint: 'mountain landscape' },
      { src: 'https://picsum.photos/800/600?random=2', alt: 'Lush green tea gardens', hint: 'tea plantation' },
      { src: 'https://picsum.photos/800/600?random=3', alt: 'Ooty Botanical Gardens', hint: 'flower garden' },
      { src: 'https://picsum.photos/800/600?random=4', alt: 'A happy tour group', hint: 'tourist group' },
      { src: 'https://picsum.photos/800/600?random=5', alt: 'Lamb\'s Rock viewpoint', hint: 'valley view' },
      { src: 'https://picsum.photos/800/600?random=6', alt: 'Nilgiri Mountain Railway', hint: 'train mountain' },
    ],
    faqs: [
      { question: 'Where can I buy a ticket for the tour?', answer: 'You can purchase tickets either on this website, on the bus, from a trusted retailer such as your hotel concierge, or from one of our on-street staff members. Please note that for hygiene reasons we encourage you to pay with card when possible so that all parties can avoid the handling of cash.' },
      { question: 'Is there a discount available for groups?', answer: 'Yes, discounts are available for groups of 20 or more. To find out more, submit an enquiry to lets@gokotagiri.com' },
      { question: 'What is the child ticketing policy?', answer: 'Passengers aged between 3 and 12 years must travel on a full ticket. All passengers under the age of 15 must be accompanied by a passenger over the age of 15. Children aged 2 years and under may travel free of charge. Strollers must be folded and stowed on the back deck.' },
      { question: 'Is luggage allowed on board the bus?', answer: 'No, luggage is not permitted on board the bus at this time. If you are looking for luggage storage then please handover at GoKotagiri Lounge near Pandian Park, Kotagiri.' },
      { question: 'Will I cover all the places from the list?', answer: 'We will try to cover all the places from the list. But sometimes based on the traffic, climatic condition and season crowds we may have to divert the route or sometime skip few places. But no worries! we are experience in these routes, will try to cover up with some hurry!' },
      { question: 'General Notes!', answer: 'Travel worry-free and enjoy having most logistics taken care of for you. Enjoy a learning experience where guide interpretation brings your chosen destination to life in a way that would be difficult to match on your own. Enjoy a higher level of safety in areas that are potential. GoKotagiri Tourism may decide to cancel the event if there are less than 8 travelers booked up for the trip from the start location. GoKotagiri Team will inform you about the cancellation before 24 hours so that you have replanning on upcoming dates or cancel to make alternate plans. We have employed a team of professional adventure leaders and a number of local tour guides to take you through this breath-taking experience. Kindly read our cancellation policies before booking an events or activities for mutual understanding.' },
    ],
  },
  {
    id: '2',
    slug: 'mudhumalai-pykara-tour',
    name: 'Mudhumalai-Pykara Tour',
    price: 349,
    duration: '10 Hours',
    overview: 'An exciting 10-hour wildlife-focused tour. Explore the Mudumalai National Park and the scenic Pykara waterfalls and lake. A treat for nature and animal lovers.',
    inclusions: ['Pickup/Drop from Ooty', '10 hours trip', 'All parking & transport included', 'Guide included'],
    exclusions: ['Entrance tickets & Safari fee not included', 'No foods included'],
    notes: [
      'Kids above 2 years will be charged.',
      'Safari timings are subject to forest department regulations.',
    ],
    disclaimers: [
        "The seat layout mentioned on the next step is just for booking reference. Mostly we will not stick to the seat numbers as it is a group bus tour concept.",
        "We might sometime not be able to visit all the places in one day as mentioned in the plan due to traffic, customer delay at any sightseeing place, etc. But we will guide and try to make it possible!"
    ],
    itinerary: [
      { time: '8:00 AM', activity: 'Assembly Point', description: 'Assemble at GoKotagiri Lounge near Pandian Park, Kotagiri.', icon: Bus, iconName: 'Bus' },
      { time: '9:00 AM', activity: 'Mudumalai Wildlife Safari', description: 'Embark on a jungle safari to spot elephants, deer, and other wildlife (2 hours).', icon: PawPrint, iconName: 'PawPrint' },
      { time: '12:00 PM', activity: 'Lunch Break', description: 'Enjoy lunch at a restaurant near the national park (cost not included).', icon: Utensils, iconName: 'Utensils' },
      { time: '2:00 PM', activity: 'Pykara Waterfalls', description: 'Witness the majestic Pykara falls and enjoy the scenic beauty (1 hour).', icon: Wind, iconName: 'Wind' },
      { time: '3:30 PM', activity: 'Pykara Lake Boat Ride', description: 'Experience a serene boat ride on the beautiful Pykara lake (1.5 hours).', icon: Sailboat, iconName: 'Sailboat' },
      { time: '5:00 PM', activity: 'Pine Forest Shooting Spot', description: 'Visit the famous pine forest, a popular spot for film shoots (30 min).', icon: Trees, iconName: 'Trees' },
      { time: '7:00 PM', activity: 'Return to Ooty', description: 'Arrive back at the drop-off point in Ooty.', icon: Bus, iconName: 'Bus' },
    ],
    gallery: [
      { src: 'https://picsum.photos/800/600?random=7', alt: 'An elephant in Mudumalai National Park', hint: 'elephant wildlife' },
      { src: 'https://picsum.photos/800/600?random=8', alt: 'Spotted deer in the wild', hint: 'deer forest' },
      { src: 'https://picsum.photos/800/600?random=9', alt: 'The beautiful Pykara Lake', hint: 'lake boat' },
      { src: 'https://picsum.photos/800/600?random=10', alt: 'Pykara waterfalls in full flow', hint: 'waterfall nature' },
      { src: 'https://picsum.photos/800/600?random=11', alt: 'A view of the pine forest', hint: 'pine forest' },
      { src: 'https://picsum.photos/800/600?random=12', alt: 'A tour jeep in the safari', hint: 'safari jeep' },
    ],
    faqs: [
        { question: 'Where can I buy a ticket for the tour?', answer: 'You can purchase tickets either on this website, on the bus, from a trusted retailer such as your hotel concierge, or from one of our on-street staff members. Please note that for hygiene reasons we encourage you to pay with card when possible so that all parties can avoid the handling of cash.' },
        { question: 'Is there a discount available for groups?', answer: 'Yes, discounts are available for groups of 20 or more. To find out more, submit an enquiry to lets@gokotagiri.com' },
        { question: 'What is the child ticketing policy?', answer: 'Passengers aged between 3 and 12 years must travel on a full ticket. All passengers under the age of 15 must be accompanied by a passenger over the age of 15. Children aged 2 years and under may travel free of charge. Strollers must be folded and stowed on the back deck.' },
        { question: 'Is luggage allowed on board the bus?', answer: 'No, luggage is not permitted on board the bus at this time. If you are looking for luggage storage then please handover at GoKotagiri Lounge near Pandian Park, Kotagiri.' },
        { question: 'Will I cover all the places from the list?', answer: 'We will try to cover all the places from the list. But sometimes based on the traffic, climatic condition and season crowds we may have to divert the route or sometime skip few places. But no worries! we are experience in these routes, will try to cover up with some hurry!' },
        { question: 'General Notes!', answer: 'Travel worry-free and enjoy having most logistics taken care of for you. Enjoy a learning experience where guide interpretation brings your chosen destination to life in a way that would be difficult to match on your own. Enjoy a higher level of safety in areas that are potential. GoKotagiri Tourism may decide to cancel the event if there are less than 8 travelers booked up for the trip from the start location. GoKotagiri Team will inform you about the cancellation before 24 hours so that you have replanning on upcoming dates or cancel to make alternate plans. We have employed a team of professional adventure leaders and a number of local tour guides to take you through this breath-taking experience. Kindly read our cancellation policies before booking an events or activities for mutual understanding.' },
    ],
  },
];
