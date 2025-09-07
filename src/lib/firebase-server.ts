
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, collection, query, where, getDocs, getDoc, doc } from 'firebase-admin/firestore';

// This is a server-only file. It is not intended to be used on the client.

// IMPORTANT: You must upload your service account JSON file to your environment
// and set the GOOGLE_APPLICATION_CREDENTIALS environment variable.
// In Firebase Studio, you can do this by creating a secret.

const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS 
  ? JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString('ascii'))
  : undefined;

if (!getApps().length) {
    initializeApp({
        credential: serviceAccount ? cert(serviceAccount) : undefined,
        projectId: 'nilgiri-explorer'
    });
}

const db = getFirestore();

export const getBlockedSeatsForDate = async (packageSlug: string, date: string): Promise<number[]> => {
    const availabilityDocId = `${packageSlug}_${date}`;
    const docRef = doc(db, "availability", availabilityDocId);
    const docSnap = await getDoc(docRef);
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
