
'use client';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc, getDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

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

// Availability Functions - Refactored for efficiency
const getAvailabilityDocRef = (packageSlug: string, date: string) => {
    const availabilityDocId = `${packageSlug}_${date}`;
    return doc(db, "availability", availabilityDocId);
}

export const getBlockedSeatsForDate = async (packageSlug: string, date: string): Promise<number[]> => {
    const docRef = getAvailabilityDocRef(packageSlug, date);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data().blockedSeats || [];
    }
    return [];
}

export const blockSeatForDate = async (packageSlug: string, date: string, seatNumber: number) => {
    const docRef = getAvailabilityDocRef(packageSlug, date);
    await setDoc(docRef, { 
        blockedSeats: arrayUnion(seatNumber),
        packageSlug, // Store for potential queries
        date,        // Store for potential queries
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
        blockedSeats: seatsToBlock,
        packageSlug,
        date
    }, { merge: true });
}

export const unblockAllSeatsForDate = async (packageSlug: string, date: string) => {
    const docRef = getAvailabilityDocRef(packageSlug, date);
    await updateDoc(docRef, {
        blockedSeats: []
    });
}


export const getOccupiedSeats = async (packageSlug: string, date: string): Promise<number[]> => {
    if (!date) return [];
    const q = query(
        collection(db, "bookings"),
        where("packageSlug", "==", packageSlug),
        where("bookingDate", "==", date)
    );

    const querySnapshot = await getDocs(q);
    const seats: number[] = [];
    querySnapshot.forEach(doc => {
        const booking = doc.data();
        if (booking.selectedSeats) {
            booking.selectedSeats.forEach((seat: { number: number }) => seats.push(seat.number));
        }
    });
    return seats;
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
