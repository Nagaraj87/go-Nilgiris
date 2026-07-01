import { NextResponse } from 'next/server';
import { verifyChecksum } from '@/lib/phonepe';
import { updateBooking } from '@/lib/firebase';
import crypto from 'crypto-js';

export async function POST(req: Request) {
    try {
        // PhonePe sends the callback data as a base64 encoded JSON string
        // inside the 'response' field, and the checksum in the headers or body.
        const body = await req.json();

        if (!body || !body.response) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const base64Response = body.response;
        // Sometimes PhonePe sends the checksum in the header X-VERIFY
        const checksum = req.headers.get('x-verify') || '';

        // Verify the checksum
        if (!verifyChecksum(base64Response, checksum)) {
            console.error('PhonePe Checksum Verification Failed:', { body, checksum });
            return NextResponse.json({ error: 'Invalid Checksum' }, { status: 400 });
        }

        // Decode the payload
        const decodedPayloadString = Buffer.from(base64Response, 'base64').toString('utf-8');
        const decodedPayload = JSON.parse(decodedPayloadString);

        const transactionId = decodedPayload.data.merchantTransactionId;
        const phonePeTransactionId = decodedPayload.data.transactionId;
        const statusCode = decodedPayload.code;

        console.log(`PhonePe Callback Received. TXN: ${transactionId}, Status: ${statusCode}`);

        if (statusCode === 'PAYMENT_SUCCESS') {
            // Here, transactionID acts as our Booking ID because we passed it as such.
            // But we actually need to look up the Firebase DB ID if we didn't pass it cleanly.
            // Since we know transactionId is saved as bookingId in Firestore:

            // NOTE: updateBooking in firebase.ts expects the internal Firestore Document ID.
            // We need to fetch the document by 'bookingId' first.
            const { getDocs, collection, query, where, getFirestore, updateDoc, doc } = await import('firebase/firestore');
            const db = getFirestore();

            const bookingsRef = collection(db, 'bookings');
            const q = query(bookingsRef, where('bookingId', '==', transactionId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                const dbId = docSnap.id;

                // Update the booking status to confirmed.
                await updateDoc(doc(db, 'bookings', dbId), {
                    paymentStatus: 'COMPLETED',
                    phonePeTransactionId: phonePeTransactionId
                });
                console.log(`Booking ${dbId} marked as COMPLETED.`);
            } else {
                console.error(`Could not find booking with transactionId: ${transactionId} in Firestore.`);
            }
        } else {
            console.error(`Payment Failed for TXN: ${transactionId}. Status Code: ${statusCode}`);
            // Ideally update the firestore document to "FAILED"
        }

        return NextResponse.json({ success: true, message: 'Callback received and processed' });

    } catch (error) {
        console.error('Error handling PhonePe Callback:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
