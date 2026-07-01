'use server';

import { saveBooking, getAvailabilityForDate as getAvailabilityForDateFromDb } from '@/lib/firebase';
import type { Booking } from '@/types';
import { Cashfree, CFEnvironment } from "cashfree-pg";

// Initialize Cashfree SDK instance
const cashfree = new Cashfree();
cashfree.XClientId = process.env.CASHFREE_APP_ID || '';
cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY || '';
cashfree.XEnvironment = process.env.CASHFREE_ENVIRONMENT === "PRODUCTION" 
    ? CFEnvironment.PRODUCTION 
    : CFEnvironment.SANDBOX;

export async function initiateCashfreePayment(bookingData: Omit<Booking, 'id'>, totalAmount: number) {
    try {
        const transactionId = `CF_${Date.now()}`;
        const customerId = `CUST_${Date.now()}`;

        // Save the booking first as pending
        const dbId = await saveBooking({ ...bookingData, bookingId: transactionId });

        // The Server-to-Server / Client-Redirect callback URL 
        const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/cashfree/verify?order_id={order_id}&booking_id=${dbId}`;

        const request = {
            order_amount: totalAmount, // Cashfree takes amount in INR, not paise
            order_currency: "INR",
            order_id: transactionId,
            customer_details: {
                customer_id: customerId,
                customer_phone: bookingData.passengers[0].phone,
                customer_name: bookingData.passengers[0].name || "Guest",
            },
            order_meta: {
                return_url: returnUrl
            }
        };

        const response = await cashfree.PGCreateOrder(request);
        
        if (response?.data?.payment_session_id) {
            return {
                success: true,
                payment_session_id: response.data.payment_session_id,
                order_id: response.data.order_id
            };
        } else {
            console.error("Cashfree API Error:", response.data);
            return { success: false, error: 'Failed to initiate payment session with Cashfree.' };
        }

    } catch (error: any) {
        console.error("Failed to initiate Cashfree payment:", error?.response?.data || error);
        return { success: false, error: 'Could not connect to payment gateway. Please try again.' };
    }
}

export async function saveSuccessfulBooking(bookingData: Omit<Booking, 'id'>) {
    try {
        const dbId = await saveBooking(bookingData);
        return { success: true, dbId };
    } catch (e) {
        console.error('Error saving booking to Firestore:', e);
        return { success: false, error: 'Payment was successful but we failed to save your booking. Please contact support.' };
    }
}

export async function getAvailabilityForDate(packageSlug: string, date: string) {
    return getAvailabilityForDateFromDb(packageSlug, date);
}
