
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, collection, query, where, getDocs, addDoc, Firestore } from 'firebase-admin/firestore';

// This is a server-only file. It is not intended to be used on the client.
// This implementation explicitly uses the service account credentials from
// the GOOGLE_APPLICATION_CREDENTIALS environment variable.

let app: App;
let db: Firestore;

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
    } else {
        console.warn("Firebase Admin SDK not initialized. GOOGLE_APPLICATION_CREDENTIALS not set.");
    }
} catch (e) {
    console.error("Firebase Admin SDK initialization error:", e);
}


export const getBlockedSeatsForDate = async (packageSlug: string, date: string): Promise<number[]> => {
    if (!db) return [];
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
    if (!db || !date) return [];
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
  if (!db) throw new Error("Database not initialized");
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
    try {
        if (!db) {
             throw new Error("Database not initialized");
        }
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
