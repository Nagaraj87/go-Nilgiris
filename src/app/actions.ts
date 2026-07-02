'use server';

import { revalidatePath } from 'next/cache';
import { updateBooking } from '@/lib/firebase';

export async function revalidateTours() {
    revalidatePath('/tours');
    revalidatePath('/');
}

export async function updateBookingAction(bookingId: string, passengers: any[], alternativePhone?: string) {
    try {
        const updatedData: any = { passengers };
        if (alternativePhone !== undefined) {
            updatedData.alternativePhone = alternativePhone;
        }
        await updateBooking(bookingId, updatedData);
        return { success: true };
    } catch (error) {
        console.error('Failed to update booking:', error);
        return { success: false, error: 'Failed to update booking.' };
    }
}
