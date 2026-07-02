'use server';

import { saveBooking, getAvailabilityForDate as getAvailabilityForDateFromDb } from '@/lib/firebase';
import type { Booking } from '@/types';
import { Cashfree, CFEnvironment } from "cashfree-pg";

// Initialize Cashfree SDK instance
const cashfree = new Cashfree(
    process.env.CASHFREE_ENVIRONMENT === "PRODUCTION" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
    process.env.CASHFREE_APP_ID || '',
    process.env.CASHFREE_SECRET_KEY || ''
);

export async function initiateCashfreePayment(bookingData: Omit<Booking, 'id'>, totalAmount: number, originUrl?: string) {
    try {
        const transactionId = `CF_${Date.now()}`;
        const customerId = `CUST_${Date.now()}`;

        // Save the booking first as pending
        const dbId = await saveBooking({ ...bookingData, bookingId: transactionId });

        // The Server-to-Server / Client-Redirect callback URL 
        const baseUrl = originUrl || process.env.NEXT_PUBLIC_BASE_URL || 
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:9002');
        const returnUrl = `${baseUrl}/api/cashfree/verify?order_id={order_id}&booking_id=${dbId}`;

        // Sanitize phone number for Cashfree to prevent payment gateway failures
        let customerPhone = bookingData.passengers[0].phone || '';
        const digitsOnly = customerPhone.replace(/[^0-9]/g, '');
        
        if (digitsOnly.length === 10) {
            customerPhone = digitsOnly;
        } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
            customerPhone = '+' + digitsOnly;
        } else {
            const cleaned = customerPhone.replace(/[^0-9+]/g, '');
            if (cleaned.startsWith('+') && cleaned.length >= 8 && cleaned.length <= 16) {
                customerPhone = cleaned;
            } else if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
                customerPhone = '+' + digitsOnly;
            } else {
                // Fallback to the default admin/support number to ensure payment never fails
                customerPhone = '8248932947';
            }
        }

        const email = bookingData.passengers[0].email?.trim();
        const isValidEmail = email ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) : false;

        const request = {
            order_amount: totalAmount, // Cashfree takes amount in INR, not paise
            order_currency: "INR",
            order_id: transactionId,
            customer_details: {
                customer_id: customerId,
                customer_phone: customerPhone,
                customer_name: bookingData.passengers[0].name || "Guest",
                ...(isValidEmail ? { customer_email: email } : {})
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
        const detail = error?.response?.data?.message || error?.message || '';
        return { 
            success: false, 
            error: `Could not connect to payment gateway${detail ? `: ${detail}` : '. Please try again.'}` 
        };
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
