
'use server';

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc, getDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove, writeBatch, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import type { TourPackage } from '@/types';
import bcrypt from 'bcryptjs';

const firebaseConfig = {
  projectId: 'nilgiri-explorer',
  appId: '1:379536738400:web:019de38a8bb5025ab7db05',
  storageBucket: 'nilgiri-explorer.appspot.com',
  apiKey: 'AIzaSyDAZjWPRX1pbM0CAC4QlZlH9eWBksqluE4',
  authDomain: 'nilgiri-explorer.firebaseapp.com',
  messagingSenderId: '379536738400',
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();

// Tour Package Functions
export const getTourPackages = async () => {
    const tourPackagesCol = collection(db, 'tour_packages');
    const snapshot = await getDocs(tourPackagesCol);
    if (snapshot.empty) {
        // One-time seed if the collection is empty. Data is hardcoded here to avoid circular dependency.
        console.log("Seeding tour_packages from static data...");
        const staticTourPackagesForSeed = [
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
              { time: '8:00 AM', activity: 'Assembly Point', description: 'Assemble at GoKotagiri Lounge near Pandian Park, Kotagiri.', iconName: 'Bus' },
              { time: '8:30 AM', activity: 'Depart Ooty', description: 'Start our journey towards the beautiful hills.', iconName: 'Car' },
              { time: '9:00 AM', activity: 'Doddabetta Peak', description: 'Visit the highest vantage point in the Nilgiris for panoramic views (1 hour).', iconName: 'Mountain' },
              { time: '11:00 AM', activity: 'Tea Estate Visit', description: 'Explore a lush tea garden and learn about tea processing (30 min).', iconName: 'Flower2' },
              { time: '12:00 PM', activity: 'Lunch Break', description: 'Break for lunch at a local restaurant (cost not included).', iconName: 'Utensils' },
              { time: '1:30 PM', activity: 'Botanical Gardens', description: 'Stroll through the vast and historic Ooty Botanical Gardens (1.5 hours).', iconName: 'Trees' },
              { time: '3:30 PM', activity: 'Coonoor Lamb\'s Rock', description: 'Enjoy stunning views of the Coimbatore plains from this viewpoint (45 min).', iconName: 'Sunset' },
              { time: '6:00 PM', activity: 'Return to Ooty', description: 'Arrive back at the drop-off point in Ooty.', iconName: 'Bus' },
            ],
            gallery: [
              { src: 'https://picsum.photos/800/600?random=1', alt: 'Breathtaking views from Doddabetta', hint: 'mountain landscape' },
              { src: 'https://picsum.photos/800/600?random=2', alt: 'Lush green tea gardens', hint: 'tea plantation' },
              { src: 'https://picsum.photos/800/600?random=3', alt: 'Ooty Botanical Gardens', hint: 'flower garden' },
            ],
            faqs: [
              { question: 'Where can I buy a ticket for the tour?', answer: 'You can purchase tickets either on this website, on the bus, from a trusted retailer such as your hotel concierge, or from one of our on-street staff members. Please note that for hygiene reasons we encourage you to pay with card when possible so that all parties can avoid the handling of cash.' },
              { question: 'Is there a discount available for groups?', answer: 'Yes, discounts are available for groups of 20 or more. To find out more, submit an enquiry to lets@gokotagiri.com' },
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
              { time: '8:00 AM', activity: 'Assembly Point', description: 'Assemble at GoKotagiri Lounge near Pandian Park, Kotagiri.', iconName: 'Bus' },
              { time: '9:00 AM', activity: 'Mudumalai Wildlife Safari', description: 'Embark on a jungle safari to spot elephants, deer, and other wildlife (2 hours).', iconName: 'PawPrint' },
              { time: '12:00 PM', activity: 'Lunch Break', description: 'Enjoy lunch at a restaurant near the national park (cost not included).', iconName: 'Utensils' },
              { time: '2:00 PM', activity: 'Pykara Waterfalls', description: 'Witness the majestic Pykara falls and enjoy the scenic beauty (1 hour).', iconName: 'Wind' },
              { time: '3:30 PM', activity: 'Pykara Lake Boat Ride', description: 'Experience a serene boat ride on the beautiful Pykara lake (1.5 hours).', iconName: 'Sailboat' },
              { time: '5:00 PM', activity: 'Pine Forest Shooting Spot', description: 'Visit the famous pine forest, a popular spot for film shoots (30 min).', iconName: 'Trees' },
              { time: '7:00 PM', activity: 'Return to Ooty', description: 'Arrive back at the drop-off point in Ooty.', iconName: 'Bus' },
            ],
            gallery: [
              { src: 'https://picsum.photos/800/600?random=7', alt: 'An elephant in Mudumalai National Park', hint: 'elephant wildlife' },
              { src: 'https://picsum.photos/800/600?random=8', alt: 'Spotted deer in the wild', hint: 'deer forest' },
            ],
            faqs: [
              { question: 'What is the child ticketing policy?', answer: 'Passengers aged between 3 and 12 years must travel on a full ticket. All passengers under the age of 15 must be accompanied by a passenger over the age of 15. Children aged 2 years and under may travel free of charge. Strollers must be folded and stowed on the back deck.' },
              { question: 'Is luggage allowed on board the bus?', answer: 'No, luggage is not permitted on board the bus at this time. If you are looking for luggage storage then please handover at GoKotagiri Lounge near Pandian Park, Kotagiri.' },
            ],
          },
        ];

        const batch = writeBatch(db);
        staticTourPackagesForSeed.forEach(pkg => {
            const docRef = doc(db, 'tour_packages', pkg.slug);
            // We don't need to strip icons here as they are just names
            batch.set(docRef, pkg);
        });
        await batch.commit();
        console.log("Seeding complete.");
        // We also seed the prices collection at the same time
        const pricesBatch = writeBatch(db);
        for (const pkg of staticTourPackagesForSeed) {
            const priceDocRef = doc(db, 'packages', pkg.slug);
            pricesBatch.set(priceDocRef, { price: pkg.price, slug: pkg.slug });
        }
        await pricesBatch.commit();

        return staticTourPackagesForSeed as TourPackage[];
    }
    return snapshot.docs.map(doc => doc.data() as TourPackage);
}

export const getTourPackageBySlug = async (slug: string): Promise<TourPackage | null> => {
    if (!slug) return null;
    const docRef = doc(db, 'tour_packages', slug);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        // Firestore doesn't store 'id' in the document data, so we add it back
        return { ...data, id: docSnap.id } as TourPackage;
    }
    return null;
}

export const createOrUpdateTourPackage = async (tourData: Omit<TourPackage, 'id' | 'gallery'>) => {
    const docRef = doc(db, 'tour_packages', tourData.slug);
    const priceDocRef = doc(db, 'packages', tourData.slug);
    
    // Create a new object for the tour package without the price, id, or gallery
    const { price, ...tourPackageData } = tourData;

    const batch = writeBatch(db);
    
    batch.set(docRef, tourPackageData, { merge: true });
    batch.set(priceDocRef, { slug: tourData.slug, price: price }, { merge: true });
    
    await batch.commit();
}

export const deleteTourPackage = async (slug: string) => {
    const docRef = doc(db, 'tour_packages', slug);
    const priceDocRef = doc(db, 'packages', slug);
    
    const batch = writeBatch(db);
    batch.delete(docRef);
    batch.delete(priceDocRef);
    
    // Also delete associated gallery images
    const galleryQuery = query(collection(db, "gallery"), where("packageSlug", "==", slug));
    const gallerySnapshot = await getDocs(galleryQuery);
    gallerySnapshot.forEach(doc => batch.delete(doc.ref));

    await batch.commit();
}

// Booking Functions
export const saveBooking = async (bookingData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'bookings'), bookingData);
    console.log('Document written with ID: ', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Could not save booking');
  }
};

export const getBookings = async () => {
    const querySnapshot = await getDocs(collection(db, "bookings"));
    const bookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort by date descending
    bookings.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
    return bookings;
}

export const getTodaysAndTomorrowsBookings = async () => {
    const now = new Date();
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + IST_OFFSET);

    const todayStr = format(istDate, 'yyyy-MM-dd');
    
    // Adjust for tomorrow by adding 24 hours to the calculated IST date
    const tomorrowDate = new Date(istDate.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = format(tomorrowDate, 'yyyy-MM-dd');
    
    const q = query(
        collection(db, "bookings"),
        where("bookingDate", "in", [todayStr, tomorrowStr])
    );

    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return bookings;
}

export const getBookingById = async (bookingId: string) => {
    if (!bookingId) {
        throw new Error('Booking ID is required.');
    }
    const bookingDocRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingDocRef);

    if (bookingSnap.exists()) {
        return { id: bookingSnap.id, ...bookingSnap.data() };
    } else {
        return null;
    }
};

export const updateBooking = async (bookingId: string, updatedData: any) => {
    if (!bookingId) {
        throw new Error('Booking ID is required.');
    }
    const bookingDocRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingDocRef, updatedData);
};


export const deleteBooking = async (bookingId: string) => {
    if (!bookingId) {
        throw new Error('Booking ID is required to delete.');
    }
    try {
        const bookingDocRef = doc(db, 'bookings', bookingId);
        await deleteDoc(bookingDocRef);
    } catch (e) {
        console.error('Error deleting document: ', e);
        throw new Error('Could not delete booking');
    }
}

export const deleteAllBookings = async () => {
    const bookingsCollection = collection(db, 'bookings');
    const querySnapshot = await getDocs(bookingsCollection);
    
    if (querySnapshot.empty) {
        console.log("No bookings to delete.");
        return;
    }

    const batch = writeBatch(db);
    querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Successfully deleted ${querySnapshot.size} bookings.`);
};


// --- Availability & Bus Management ---

const getAvailabilityDocRef = (packageSlug: string, date: string) => {
    const availabilityDocId = `${packageSlug}_${date}`;
    return doc(db, "availability", availabilityDocId);
}

export const getBlockedSeatsForDate = async (packageSlug: string, date: string): Promise<number[]> => {
    const docRef = getAvailabilityDocRef(packageSlug, date);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return data.blockedSeats || [];
    }
    return [];
};


export const blockSeatForDate = async (packageSlug: string, date: string, seatNumber: number) => {
    const docRef = getAvailabilityDocRef(packageSlug, date);
    await setDoc(docRef, { 
        blockedSeats: arrayUnion(seatNumber),
    }, { merge: true });
}

export const unblockSeatForDate = async (packageSlug: string, date: string, seatNumber: number) => {
    const docRef = getAvailabilityDocRef(packageSlug, date);
     await updateDoc(docRef, {
        blockedSeats: arrayRemove(seatNumber)
    });
}

export const blockAllSeatsForDate = async (packageSlug: string, date: string, seatsToBlock: number[]) => {
    const docRef = getAvailabilityDocRef(packageSlug, date);
    await setDoc(docRef, {
        blockedSeats: seatsToBlock
    }, { merge: true });
}

export const unblockAllSeatsForDate = async (packageSlug: string, date: string) => {
    const docRef = getAvailabilityDocRef(packageSlug, date);
    await updateDoc(docRef, {
        blockedSeats: []
    });
}

export const getOccupiedSeatsForDate = async (packageSlug:string, date: string): Promise<number[]> => {
    if (!date) return [];
    const q = query(
        collection(db, "bookings"),
        where("packageSlug", "==", packageSlug),
        where("bookingDate", "==", date)
    );

    const querySnapshot = await getDocs(q);
    const occupiedSeats: number[] = [];

    querySnapshot.forEach(doc => {
        const booking = doc.data();
        if (booking.selectedSeats) {
            booking.selectedSeats.forEach((seat: { number: number }) => occupiedSeats.push(seat.number));
        }
    });

    return occupiedSeats;
};


// Gallery Functions
export const addGalleryImageToFirestore = async (url: string, alt: string, packageSlug: string) => {
     const docRef = await addDoc(collection(db, 'gallery'), {
        url: url,
        alt: alt,
        packageSlug: packageSlug,
        createdAt: new Date(),
    });
    return { id: docRef.id, url, alt, packageSlug };
}

export const getGalleryImages = async (packageSlug: string) => {
    const q = query(
        collection(db, "gallery"),
        where("packageSlug", "==", packageSlug)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt;
        if (createdAt instanceof Timestamp) {
            data.createdAt = createdAt.toDate().toISOString();
        }
        return { id: doc.id, ...data };
    });
};

export const deleteGalleryImageFromFirestore = async (docId: string) => {
    const docRef = doc(db, 'gallery', docId);
    await deleteDoc(docRef);
};

// Price Management Functions
export const getPackagePrices = async (): Promise<{ slug: string, price: number }[]> => {
    const packagesCol = collection(db, 'packages');
    const snapshot = await getDocs(packagesCol);
    if (snapshot.empty) {
        // This part runs only if the 'packages' collection is empty, seeding from tour_packages default.
        const defaultTourPackages = [
          { slug: 'ooty-coonoor-tour', price: 349 },
          { slug: 'mudhumalai-pykara-tour', price: 349 }
        ];

        const batch = writeBatch(db);
        for (const pkg of defaultTourPackages) {
            const docRef = doc(db, 'packages', pkg.slug);
            batch.set(docRef, { price: pkg.price, slug: pkg.slug });
        }
        await batch.commit();
        return defaultTourPackages;
    }
    return snapshot.docs.map(doc => doc.data() as { slug: string, price: number });
};

export const getPackagePrice = async (slug: string): Promise<number> => {
    const docRef = doc(db, 'packages', slug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data().price;
    }
    
    // Fallback for a missing specific package
    const staticTourPackages = [
      { slug: 'ooty-coonoor-tour', price: 349 },
      { slug: 'mudhumalai-pykara-tour', price: 349 }
    ];
    const staticPackage = staticTourPackages.find(p => p.slug === slug);
    const defaultPrice = staticPackage?.price || 349;
    
    await setDoc(docRef, { slug, price: defaultPrice });
    return defaultPrice;
}

export const updatePackagePrice = async (slug: string, price: number) => {
    const docRef = doc(db, 'packages', slug);
    await setDoc(docRef, { price: price, slug: slug }, { merge: true });
};


// Site Config Functions
export const getContactInfo = async (): Promise<{ whatsapp: string, call: string }> => {
    const docRef = doc(db, 'site_config', 'contact');
    const docSnap = await getDoc(docRef);
if (docSnap.exists()) {
        return docSnap.data() as { whatsapp: string, call: string };
    } else {
        // Default values if not set
        const defaultData = { whatsapp: '8248932947', call: '7418066906' };
        await setDoc(docRef, defaultData);
        return defaultData;
    }
};

export const updateContactInfo = async (data: { whatsapp: string, call: string }) => {
    const docRef = doc(db, 'site_config', 'contact');
    await setDoc(docRef, data, { merge: true });
};


// Admin Credentials
const ADMIN_DOC_REF = doc(db, 'site_config', 'admin_credentials');

export const getAdminCredentials = async (): Promise<{username: string; password?: string}> => {
    const docSnap = await getDoc(ADMIN_DOC_REF);
    if(docSnap.exists()) {
        return docSnap.data() as {username: string; password?: string};
    } else {
        // Default credentials
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password', salt);
        const defaultCreds = {username: 'admin', password: hashedPassword};
        await setDoc(ADMIN_DOC_REF, defaultCreds);
        return defaultCreds;
    }
}

export const updateAdminCredentials = async(credentials: {username: string; password?: string}) => {
    const dataToUpdate: {username: string; password?: string} = {username: credentials.username};
    if(credentials.password && credentials.password.length > 0) {
        const salt = await bcrypt.genSalt(10);
        dataToUpdate.password = await bcrypt.hash(credentials.password, salt);
    }
    await setDoc(ADMIN_DOC_REF, dataToUpdate, {merge: true});
}
