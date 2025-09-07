
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, collection, query, where, getDocs, addDoc } from 'firebase-admin/firestore';

// This is a server-only file. It is not intended to be used on the client.
// The Firebase Admin SDK is initialized without credentials, as it will automatically
// detect them from the GOOGLE_APPLICATION_CREDENTIALS environment variable in a
// standard server environment like Firebase App Hosting.

if (!getApps().length) {
    initializeApp();
}

const db = getFirestore();

export const getBlockedSeatsForDate = async (packageSlug: string, date: string): Promise<number[]> => {
    const availabilityDocId = `${packageSlug}_${date}`;
    const docRef = db.collection("availability").doc(availabilityDocId);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
        const data = docSnap.data();
        return data?.blockedSeats || [];
    }
    return [];
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

// Server-side saveBooking for use in Server Actions
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

// Server-side function to get the hero image
export const getHeroImage = async () => {
    const docRef = db.collection('site_config').doc('hero');
    const docSnap = await docRef.get();
    if (docSnap.exists) {
        return docSnap.data();
    }
    // Return a default if it doesn't exist
    return { url: 'https://picsum.photos/1920/1080' };
};

