

'use server';

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc, getDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove, writeBatch, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import type { TourPackage, Booking, ContactInfo, GalleryImage, AdminCredentials } from '@/types';

const firebaseConfig = {
  projectId: 'nilgiri-explorer',
  appId: '1:379536738400:web:019de38a8bb5025ab7db05',
  storageBucket: 'nilgiri-explorer.appspot.com',
  apiKey: 'AIzaSyDAZjWPRX1pbM0CAC4QlZlH9eWBksqluE4',
  authDomain: 'nil-explorer.firebaseapp.com',
  messagingSenderId: '379536738400',
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();

// Tour Package Functions
export const getTourPackages = async (): Promise<TourPackage[]> => {
    const tourPackagesCol = collection(db, 'tour_packages');
    const snapshot = await getDocs(tourPackagesCol);
    if (snapshot.empty) {
        return []; // Should not seed from here in production to avoid race conditions. Seeding should be a separate script.
    }
    return snapshot.docs.map(doc => ({...doc.data(), id: doc.id } as TourPackage));
}

export const getTourPackageBySlug = async (slug: string): Promise<TourPackage | null> => {
    if (!slug) return null;
    const docRef = doc(db, 'tour_packages', slug);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
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
export const saveBooking = async (bookingData: Omit<Booking, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'bookings'), bookingData);
    console.log('Document written with ID: ', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Could not save booking');
  }
};

export const getBookings = async (): Promise<Booking[]> => {
    const querySnapshot = await getDocs(collection(db, "bookings"));
    const bookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    // Sort by date descending
    bookings.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
    return bookings;
}

export const getTodaysAndTomorrowsBookings = async (): Promise<Booking[]> => {
    const now = new Date();
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + IST_OFFSET);

    const todayStr = format(istDate, 'yyyy-MM-dd');
    
    const tomorrowDate = new Date(istDate.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = format(tomorrowDate, 'yyyy-MM-dd');
    
    const q = query(
        collection(db, "bookings"),
        where("bookingDate", "in", [todayStr, tomorrowStr])
    );

    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    return bookings;
}

export const getBookingById = async (bookingId: string): Promise<Booking | null> => {
    if (!bookingId) {
        throw new Error('Booking ID is required.');
    }
    const bookingDocRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingDocRef);

    if (bookingSnap.exists()) {
        return { id: bookingSnap.id, ...bookingSnap.data() } as Booking;
    } else {
        return null;
    }
};

export const updateBooking = async (bookingId: string, updatedData: Partial<Booking>) => {
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

export const getAvailabilityForDate = async (packageSlug: string, date: string): Promise<{ blocked: number[], occupied: number[] }> => {
    if (!packageSlug || !date) {
        return { blocked: [], occupied: [] };
    }
    
    const [blockedSeats, occupiedSeats] = await Promise.all([
        getBlockedSeatsForDate(packageSlug, date),
        getOccupiedSeatsForDate(packageSlug, date)
    ]);
    
    return { blocked: blockedSeats, occupied: occupiedSeats };
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
        const booking = doc.data() as Booking;
        if (booking.selectedSeats) {
            booking.selectedSeats.forEach((seat: { number: number }) => occupiedSeats.push(seat.number));
        }
    });

    return occupiedSeats;
};


// Gallery Functions
export const addGalleryImageToFirestore = async (url: string, alt: string, packageSlug: string): Promise<GalleryImage> => {
     const docRef = await addDoc(collection(db, 'gallery'), {
        url: url,
        alt: alt,
        packageSlug: packageSlug,
        createdAt: new Date(),
    });
    return { id: docRef.id, url, alt, packageSlug, createdAt: new Date().toISOString() };
}

export const getGalleryImages = async (packageSlug: string): Promise<GalleryImage[]> => {
    const q = query(
        collection(db, "gallery"),
        where("packageSlug", "==", packageSlug)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Timestamp to a serializable format (ISO string)
        const createdAt = (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();
        return { id: doc.id, ...data, createdAt } as GalleryImage;
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
        return [];
    }
    return snapshot.docs.map(doc => doc.data() as { slug: string, price: number });
};

export const getPackagePrice = async (slug: string): Promise<number> => {
    const docRef = doc(db, 'packages', slug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data().price;
    }
    // Fallback: Try to get price from the main tour package document
    const tourPackage = await getTourPackageBySlug(slug);
    if (tourPackage) {
        // If found, create the price document for future lookups
        await setDoc(docRef, { slug, price: tourPackage.price });
        return tourPackage.price;
    }

    // Ultimate fallback
    const defaultPrice = 349;
    await setDoc(docRef, { slug, price: defaultPrice });
    return defaultPrice;
}

export const updatePackagePrice = async (slug: string, price: number) => {
    const docRef = doc(db, 'packages', slug);
    await setDoc(docRef, { price: price, slug: slug }, { merge: true });
};


// Site Config Functions
export const getContactInfo = async (): Promise<ContactInfo> => {
    const docRef = doc(db, 'site_config', 'contact');
    const docSnap = await getDoc(docRef);
if (docSnap.exists()) {
        return docSnap.data() as ContactInfo;
    } else {
        // Default values if not set
        const defaultData: ContactInfo = { whatsapp: '8248932947', call: '7418066906' };
        await setDoc(docRef, defaultData);
        return defaultData;
    }
};

export const updateContactInfo = async (data: ContactInfo) => {
    const docRef = doc(db, 'site_config', 'contact');
    await setDoc(docRef, data, { merge: true });
};


// Admin Credentials
const ADMIN_DOC_REF = doc(db, 'site_config', 'admin_credentials');

export const getAdminCredentials = async (): Promise<AdminCredentials> => {
    const docSnap = await getDoc(ADMIN_DOC_REF);
    
    if (docSnap.exists()) {
        return docSnap.data() as AdminCredentials;
    } else {
        // Self-heal: Create default credentials if they don't exist
        const defaultCreds: AdminCredentials = { username: 'admin', password: 'password' }; // Store plain text for simplicity
        await setDoc(ADMIN_DOC_REF, defaultCreds);
        return defaultCreds;
    }
}

export const updateAdminCredentials = async(credentials: Partial<AdminCredentials>) => {
    const dataToUpdate: Partial<AdminCredentials> = { username: credentials.username };
    // Only update password if a new one is provided
    if (credentials.password) {
        dataToUpdate.password = credentials.password;
    }
    await setDoc(ADMIN_DOC_REF, dataToUpdate, {merge: true});
}

export const verifyAdminCredentials = async (username: string, password?: string): Promise<boolean> => {
  try {
    const credentials = await getAdminCredentials();
    
    if (!password || !credentials.password) {
      return false;
    }
    
    const usernameMatch = credentials.username === username;
    const passwordMatch = credentials.password === password; // Plain text comparison
    
    return usernameMatch && passwordMatch;
  } catch (error) {
    console.error("Error verifying credentials:", error);
    return false;
  }
};
