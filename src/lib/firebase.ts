'use client';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, writeBatch, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { tourPackages } from './data';

const firebaseConfig = {
  projectId: 'nilgiri-explorer',
  appId: '1:379536738400:web:019de38a8bb5025ab7db05',
  storageBucket: 'nilgiri-explorer.firebasestorage.app',
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

// Availability Functions
export const getBlockedDates = async (): Promise<Date[]> => {
    const q = query(collection(db, "blocked_dates"), where("isFullyBlocked", "==", true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => new Date(doc.id));
}

export const blockDate = async (date: string) => {
    const dateDocRef = doc(db, 'blocked_dates', date);
    await setDoc(dateDocRef, { isFullyBlocked: true, date: new Date(date) }, { merge: true });
}

export const unblockDate = async (date: string) => {
    const dateDocRef = doc(db, 'blocked_dates', date);
    await setDoc(dateDocRef, { isFullyBlocked: false }, { merge: true });
}

export const getBlockedSeatsForDate = async (packageSlug: string, date: string): Promise<number[]> => {
    const q = query(
        collection(db, "blocked_seats"), 
        where("packageSlug", "==", packageSlug), 
        where("date", "==", date)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().seatNumber);
}

export const blockSeatForDate = async (packageSlug: string, date: string, seatNumber: number) => {
    await addDoc(collection(db, 'blocked_seats'), { packageSlug, date, seatNumber });
}

export const unblockSeatForDate = async (packageSlug: string, date: string, seatNumber: number) => {
    const q = query(
        collection(db, "blocked_seats"), 
        where("packageSlug", "==", packageSlug), 
        where("date", "==", date),
        where("seatNumber", "==", seatNumber)
    );
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}

export const blockAllSeatsForDate = async (packageSlug: string, date: string, totalSeats: number) => {
    // First clear any existing individually blocked seats for this date/package
    const q = query(
        collection(db, "blocked_seats"), 
        where("packageSlug", "==", packageSlug), 
        where("date", "==", date)
    );
    const querySnapshot = await getDocs(q);
    const deleteBatch = writeBatch(db);
    querySnapshot.forEach(doc => {
        deleteBatch.delete(doc.ref);
    });
    await deleteBatch.commit();

    // Then block all seats
    const writeBatch = writeBatch(db);
    for (let i = 1; i <= totalSeats; i++) {
        const newDocRef = doc(collection(db, 'blocked_seats'));
        writeBatch.set(newDocRef, { packageSlug, date, seatNumber: i });
    }
    await writeBatch.commit();
}

export const unblockAllSeatsForDate = async (packageSlug: string, date: string) => {
    const q = query(
        collection(db, "blocked_seats"), 
        where("packageSlug", "==", packageSlug), 
        where("date", "==", date)
    );
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}

export const getOccupiedSeats = async (packageSlug: string, date: string): Promise<number[]> => {
    if (!date) return [];
    const q = query(
        collection(db, "bookings"),
        where("packageSlug", "==", packageSlug),
        where("bookingDate", "==", new Date(date).toISOString())
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
