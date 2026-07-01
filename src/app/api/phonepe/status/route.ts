import { NextResponse } from 'next/server';
import { getDocs, collection, query, where, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

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

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get('tid');

    if (!transactionId) {
        return NextResponse.json({ error: 'Missing transaction ID' }, { status: 400 });
    }

    try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(bookingsRef, where('bookingId', '==', transactionId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return NextResponse.json({ paymentStatus: 'PENDING' });
        }

        const bookingData = querySnapshot.docs[0].data();
        const paymentStatus = bookingData.paymentStatus || 'PENDING';

        return NextResponse.json({ paymentStatus });
    } catch (error) {
        console.error('Error checking payment status:', error);
        return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
    }
}
