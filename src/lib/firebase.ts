
'use server';

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc, getDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove, writeBatch } from 'firebase/firestore';
import { format, addDays } from 'date-fns';
import type { AdminCredentials } from '@/types';

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
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');

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

export const getOccupiedSeatsForDate = async (packageSlug: string, date: string): Promise<number[]> => {
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
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Deletes the Firestore document, but not the image from its source URL.
export const deleteGalleryImageFromFirestore = async (docId: string) => {
    const docRef = doc(db, 'gallery', docId);
    await deleteDoc(docRef);
};

// Price Management Functions
export const getPackagePrices = async (): Promise<{ slug: string, price: number }[]> => {
    const packagesCol = collection(db, 'packages');
    const snapshot = await getDocs(packagesCol);
    if (snapshot.empty) {
        // One-time seed if the collection is empty
        const { tourPackages } = await import('@/lib/data');
        const batch = writeBatch(db);
        for (const pkg of tourPackages) {
            const docRef = doc(db, 'packages', pkg.slug);
            batch.set(docRef, { price: pkg.price, slug: pkg.slug });
        }
        await batch.commit();
        return tourPackages.map(p => ({ slug: p.slug, price: p.price }));
    }
    return snapshot.docs.map(doc => doc.data() as { slug: string, price: number });
};

export const getPackagePrice = async (slug: string): Promise<number> => {
    const docRef = doc(db, 'packages', slug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data().price;
    }
    // Fallback or error
    const { tourPackages } = await import('@/lib/data');
    const staticPackage = tourPackages.find(p => p.slug === slug);
    if(staticPackage) {
        // Seed this one package if it was missing
        await setDoc(docRef, { price: staticPackage.price, slug: staticPackage.slug });
        return staticPackage.price;
    }
    throw new Error(`Package price for ${slug} not found`);
}

export const updatePackagePrice = async (slug: string, price: number) => {
    const docRef = doc(db, 'packages', slug);
    await setDoc(docRef, { price: price }, { merge: true });
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

export const getAdminCredentials = async (): Promise<AdminCredentials> => {
    const docRef = doc(db, 'site_config', 'credentials');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as AdminCredentials;
    } else {
        // Default values if not set, store them.
        const defaultData = { username: 'admin', password: 'admin' };
        await setDoc(docRef, defaultData);
        return defaultData;
    }
};

export const updateAdminCredentials = async (data: AdminCredentials) => {
    const docRef = doc(db, 'site_config', 'credentials');
    await setDoc(docRef, data);
};
