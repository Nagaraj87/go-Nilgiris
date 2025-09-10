
'use server';

import { createOrder as createRazorpayOrder } from '@/lib/razorpay';
import { saveBooking, getAvailabilityForDate as getAvailabilityForDateFromDb } from '@/lib/firebase';
import type { Booking } from '@/types';

export async function createPaymentOrder(totalAmount: number) {
    try {
        const order = await createRazorpayOrder(totalAmount);
        return { success: true, order };
    } catch (error) {
        console.error("Failed to create order:", error);
        return { success: false, error: 'Could not initiate payment. Please try again.' };
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
