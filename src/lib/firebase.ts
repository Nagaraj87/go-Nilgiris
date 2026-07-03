
'use server';

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc, getDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove, writeBatch, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import type { TourPackage, Booking, ContactInfo, GalleryImage, AdminCredentials, EmergencyConfig } from '@/types';
import { hash, compare } from 'bcryptjs';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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
        return [];
    }
    return snapshot.docs.map(doc => ({...doc.data(), id: doc.id } as TourPackage));
}

export const getTourPackageBySlug = async (slug: string): Promise<TourPackage | null> => {
    if (!slug) return null;
    const decodedSlug = decodeURIComponent(slug);
    const docRef = doc(db, 'tour_packages', decodedSlug);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        let price = data.price;
        let discount = data.discount || 0;

        if (price === undefined) {
            // Backwards compatibility: fetch price from packages collection if not in tour_packages
            const priceDocRef = doc(db, 'packages', decodedSlug);
            const priceDocSnap = await getDoc(priceDocRef);
            price = priceDocSnap.exists() ? priceDocSnap.data().price : 0;
        }

        return { ...data, price, discount, id: docSnap.id } as TourPackage;
    }
    return null;
}

export const createOrUpdateTourPackage = async (tourData: Omit<TourPackage, 'id' | 'gallery'>) => {
    const docRef = doc(db, 'tour_packages', tourData.slug);
    const priceDocRef = doc(db, 'packages', tourData.slug);
    
    const { price, discount = 0, ...tourPackageData } = tourData;
    const finalPrice = Math.round(price * (1 - discount / 100));

    const batch = writeBatch(db);
    
    batch.set(docRef, { ...tourPackageData, price, discount }, { merge: true });
    batch.set(priceDocRef, { slug: tourData.slug, price: finalPrice }, { merge: true });
    
    await batch.commit();
}

export const deleteTourPackage = async (slug: string) => {
    const docRef = doc(db, 'tour_packages', slug);
    const priceDocRef = doc(db, 'packages', slug);
    
    const batch = writeBatch(db);
    batch.delete(docRef);
    batch.delete(priceDocRef);
    
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
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
}

export const getBookingById = async (bookingId: string): Promise<Booking | null> => {
    if (!bookingId) throw new Error('Booking ID is required.');
    const bookingDocRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingDocRef);
    return bookingSnap.exists() ? { id: bookingSnap.id, ...bookingSnap.data() } as Booking : null;
};

export const updateBooking = async (bookingId: string, updatedData: Partial<Booking>) => {
    if (!bookingId) throw new Error('Booking ID is required.');
    const bookingDocRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingDocRef, updatedData);
};


export const deleteBooking = async (bookingId: string) => {
    if (!bookingId) throw new Error('Booking ID is required to delete.');
    const bookingDocRef = doc(db, 'bookings', bookingId);
    await deleteDoc(bookingDocRef);
}

export const deleteAllBookings = async () => {
    const bookingsCollection = collection(db, 'bookings');
    const querySnapshot = await getDocs(bookingsCollection);
    
    if (querySnapshot.empty) return;

    const batch = writeBatch(db);
    querySnapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
};

// --- Availability & Bus Management ---
const getAvailabilityDocRef = (packageSlug: string, date: string) => {
    return doc(db, "availability", `${packageSlug}_${date}`);
}

export const getAvailabilityForDate = async (packageSlug: string, date: string): Promise<{ blocked: number[], occupied: number[] }> => {
    if (!packageSlug || !date) return { blocked: [], occupied: [] };
    const [blockedSeats, occupiedSeats] = await Promise.all([
        getBlockedSeatsForDate(packageSlug, date),
        getOccupiedSeatsForDate(packageSlug, date)
    ]);
    return { blocked: blockedSeats, occupied: occupiedSeats };
}

export const getBlockedSeatsForDate = async (packageSlug: string, date: string): Promise<number[]> => {
    const docRef = getAvailabilityDocRef(packageSlug, date);
    const docSnap = await getDoc(docRef);
    return (docSnap.exists() && docSnap.data().blockedSeats) || [];
};

export const blockSeatForDate = async (packageSlug: string, date: string, seatNumber: number) => {
    const docRef = getAvailabilityDocRef(packageSlug, date);
    await setDoc(docRef, { blockedSeats: arrayUnion(seatNumber) }, { merge: true });
}

export const unblockSeatForDate = async (packageSlug: string, date: string, seatNumber: number) => {
    const docRef = getAvailabilityDocRef(packageSlug, date);
    await updateDoc(docRef, { blockedSeats: arrayRemove(seatNumber) });
}

export const blockAllSeatsForDate = async (packageSlug: string, date: string, seatsToBlock: number[]) => {
    const docRef = getAvailabilityDocRef(packageSlug, date);
    await setDoc(docRef, { blockedSeats: seatsToBlock }, { merge: true });
}

export const unblockAllSeatsForDate = async (packageSlug: string, date: string) => {
    const docRef = getAvailabilityDocRef(packageSlug, date);
    await updateDoc(docRef, { blockedSeats: [] });
}

export const getOccupiedSeatsForDate = async (packageSlug:string, date: string): Promise<number[]> => {
    if (!date) return [];
    const q = query(
        collection(db, "bookings"),
        where("packageSlug", "==", packageSlug),
        where("bookingDate", "==", date)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.flatMap(doc => (doc.data() as Booking).selectedSeats.map(seat => seat.number));
};

// Gallery Functions
export const addGalleryImageToFirestore = async (url: string, alt: string, packageSlug: string): Promise<GalleryImage> => {
     const docRef = await addDoc(collection(db, 'gallery'), { url, alt, packageSlug, createdAt: new Date() });
    return { id: docRef.id, url, alt, packageSlug, createdAt: new Date().toISOString() };
}

export const getGalleryImages = async (packageSlug: string): Promise<GalleryImage[]> => {
    const q = query(collection(db, "gallery"), where("packageSlug", "==", packageSlug));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();
        return { id: doc.id, ...data, createdAt } as GalleryImage;
    });
};

export const deleteGalleryImageFromFirestore = async (docId: string) => {
    await deleteDoc(doc(db, 'gallery', docId));
};

// Price Management Functions
export const getPackagePrices = async (): Promise<{ slug: string, price: number }[]> => {
    const snapshot = await getDocs(collection(db, 'packages'));
    return snapshot.docs.map(doc => doc.data() as { slug: string, price: number });
};

export const getPackagePrice = async (slug: string): Promise<number | null> => {
    if (!slug) return null;
    const decodedSlug = decodeURIComponent(slug);
    const docRef = doc(db, 'packages', decodedSlug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data().price;
    
    const tourPackage = await getTourPackageBySlug(slug);
    const price = tourPackage ? tourPackage.price : 349;
    await setDoc(docRef, { slug, price });
    return price;
}

export const updatePackagePrice = async (slug: string, price: number) => {
    await setDoc(doc(db, 'packages', slug), { price, slug }, { merge: true });
};

// Site Config Functions
export const getContactInfo = async (): Promise<ContactInfo> => {
    const docRef = doc(db, 'site_config', 'contact');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data() as ContactInfo;

    const defaultData: ContactInfo = { whatsapp: '8248932947', call: '7418066906' };
    await setDoc(docRef, defaultData);
    return defaultData;
};

export const updateContactInfo = async (data: ContactInfo) => {
    await setDoc(doc(db, 'site_config', 'contact'), data, { merge: true });
};

// Admin Authentication
export const verifyAdminCredentials = async (username: string, passwordPlain: string): Promise<boolean> => {
    try {
        const docRef = doc(db, 'admin_credentials', username);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) return false;
        
        const data = docSnap.data();
        const { compare } = await import('bcryptjs');
        const isValid = await compare(passwordPlain, data.passwordHash);
        
        return isValid;
    } catch (e) {
        console.error("Error verifying admin credentials", e);
        return false;
    }
};

export const createInitialAdmin = async (username: string, passwordPlain: string) => {
    try {
        const { hash } = await import('bcryptjs');
        const passwordHash = await hash(passwordPlain, 10);
        await setDoc(doc(db, 'admin_credentials', username), { passwordHash });
        console.log(`Admin user ${username} created successfully.`);
    } catch (e) {
        console.error("Error creating initial admin", e);
    }
};

export const getAdminCredentials = async (): Promise<AdminCredentials> => {
    const querySnapshot = await getDocs(collection(db, 'admin_credentials'));
    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { username: doc.id, password: '' };
    }
    return { username: 'admin', password: '' };
};

export const updateAdminCredentials = async (credentials: Partial<AdminCredentials>) => {
    if (!credentials.username) return;
    
    const docRef = doc(db, 'admin_credentials', credentials.username);
    const updates: any = {};
    
    if (credentials.password) {
        const { hash } = await import('bcryptjs');
        updates.passwordHash = await hash(credentials.password, 10);
    }
    
    await setDoc(docRef, updates, { merge: true });
};

// Emergency Config
export const getEmergencyConfig = async (): Promise<EmergencyConfig> => {
    const docRef = doc(db, 'site_config', 'emergency');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data() as EmergencyConfig;

    const defaultData: EmergencyConfig = { isActive: false, message: 'Notice: Due to heavy rains, some routes might be affected.' };
    await setDoc(docRef, defaultData);
    return defaultData;
};

export const updateEmergencyConfig = async (data: EmergencyConfig) => {
    await setDoc(doc(db, 'site_config', 'emergency'), data, { merge: true });
};
