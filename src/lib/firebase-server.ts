
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This is a server-only file. It is not intended to be used on the client.
// This implementation explicitly uses the service account credentials from
// the GOOGLE_APPLICATION_CREDENTIALS environment variable.

let app: App;
let db: Firestore;

function getDb(): Firestore {
    if (db) {
        return db;
    }

    try {
        const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        if (serviceAccount) {
            if (!getApps().length) {
                app = initializeApp({
                    credential: cert(JSON.parse(serviceAccount)),
                    projectId: 'nilgiri-explorer'
                });
            } else {
                app = getApps()[0];
            }
            db = getFirestore(app);
            return db;
        } else {
             throw new Error("Firebase Admin SDK not initialized. GOOGLE_APPLICATION_CREDENTIALS not set.");
        }
    } catch (e) {
        console.error("Firebase Admin SDK initialization error:", e);
        throw new Error("Could not initialize Firebase Admin SDK.");
    }
}


export const getBlockedSeatsForDate = async (packageSlug: string, date: string): Promise<number[]> => {
    const db = getDb();
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
    const db = getDb();
    if (!date) return [];
    const q = db.collection("bookings")
        .where("packageSlug", "==", packageSlug)
        .where("bookingDate", "==", date);

    const querySnapshot = await q.get();
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
  const db = getDb();
  try {
    const docRef = await db.collection('bookings').add(bookingData);
    console.log('Document written with ID: ', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Could not save booking');
  }
};

// Server-side function to get the hero image
export const getHeroImage = async () => {
    try {
        const db = getDb();
        const docRef = db.collection('site_config').doc('hero');
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            const data = docSnap.data();
            if (data && data.url) {
                return data;
            }
        }
    } catch (e) {
        console.error("Error fetching hero image from Firestore:", e);
    }
    // Return a default if it doesn't exist or an error occurs
    return { url: 'https://picsum.photos/1920/1080' };
};
