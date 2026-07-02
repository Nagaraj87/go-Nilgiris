import { NextResponse } from 'next/server';
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { updateBooking } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

const cashfree = new Cashfree(
    process.env.CASHFREE_ENVIRONMENT === "PRODUCTION" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
    process.env.CASHFREE_APP_ID || '',
    process.env.CASHFREE_SECRET_KEY || ''
);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const order_id = searchParams.get('order_id');
    const booking_id = searchParams.get('booking_id');

    // Dynamically resolve the base URL using headers to keep users on their custom domain
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const baseUrl = host ? `${proto}://${host}` : request.url;

    if (!order_id || !booking_id) {
        return NextResponse.redirect(new URL('/booking/status?error=missing_params', baseUrl));
    }

    try {
        // Fetch order details from Cashfree
        const response = await cashfree.PGOrderFetchPayments(order_id);
        
        let paymentStatus = 'FAILED';
        
        // Cashfree returns an array of payments for the order. We look for a SUCCESS one.
        if (response?.data && response.data.length > 0) {
            const successfulPayment = response.data.find((payment: any) => payment.payment_status === "SUCCESS");
            if (successfulPayment) {
                paymentStatus = 'SUCCESS';
            }
        }

        // Update Firestore booking document
        await updateBooking(booking_id, {
            paymentStatus: paymentStatus,
            updatedAt: new Date().toISOString()
        } as any);

        if (paymentStatus === 'SUCCESS') {
            revalidatePath('/');
            revalidatePath('/tours');
        }

        // Redirect user back to the status page with success or failure
        return NextResponse.redirect(
            new URL(`/booking/status?id=${booking_id}&tid=${order_id}&status=${paymentStatus}`, baseUrl)
        );

    } catch (error) {
        console.error("Error verifying Cashfree payment:", error);
        return NextResponse.redirect(new URL(`/booking/status?id=${booking_id}&error=verification_failed`, baseUrl));
    }
}
