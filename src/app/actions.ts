
'use server';
import { saveBooking, getOccupiedSeats, getBlockedSeatsForDate } from '@/lib/firebase';
import { tourPackages } from '@/lib/data';
import { format } from 'date-fns';

export async function customizeItineraryAction(prevState: any, formData: FormData): Promise<any> {
  // This is a placeholder now that the AI functionality has been removed.
  return { error: 'This feature is no longer available.' };
}


// Dummy data for passenger generation
const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Saanvi", "Anya", "Aadhya", "Ananya", "Diya", "Pari", "Riya", "Myra", "Kiara", "Anika"];
const lastNames = ["Kumar", "Singh", "Gupta", "Sharma", "Patel", "Shah", "Mehta", "Jain", "Khan", "Malhotra"];

function generateRandomPassenger() {
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const age = Math.floor(Math.random() * 50) + 18; // Adults between 18-68
    const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    return { name, age, gender };
}


export async function createDummyBooking(data: { packageSlug: string; bookingDate: Date; memberCount: number }) {
  const { packageSlug, bookingDate, memberCount } = data;
  const tourPackage = tourPackages.find(p => p.slug === packageSlug);
  if (!tourPackage) {
    return { error: "Invalid tour package selected." };
  }

  const dateStr = format(bookingDate, "yyyy-MM-dd");

  try {
    const [occupiedSeats, adminBlockedSeats] = await Promise.all([
      getOccupiedSeats(packageSlug, dateStr),
      getBlockedSeatsForDate(packageSlug, dateStr),
    ]);
    
    const allBookedSeats = new Set([...occupiedSeats, ...adminBlockedSeats]);
    const totalSeats = 40;
    const availableSeats = Array.from({ length: totalSeats }, (_, i) => i + 1).filter(seat => !allBookedSeats.has(seat));

    if (availableSeats.length < memberCount) {
      return { error: `Not enough available seats. Only ${availableSeats.length} seats are free.` };
    }
    
    let successCount = 0;
    for (let i = 0; i < memberCount; i++) {
        const passenger = generateRandomPassenger();
        const seatNumber = availableSeats.pop();

        if(!seatNumber) continue; // Should not happen due to check above, but for safety

        const isWindow = seatNumber % 4 === 0 || seatNumber % 4 === 3;
        const price = tourPackage.price + (isWindow ? 50 : 0);
        
        const bookingId = `DUMMY-${Math.random().toString(36).substr(2, 7).toUpperCase()}`;

        const bookingData = {
          bookingId,
          packageSlug,
          bookingDate: dateStr,
          memberCount: 1,
          passengers: [passenger],
          selectedSeats: [{ number: seatNumber, price }],
          totalAmount: price,
          isDummy: true // Flag to identify dummy bookings if needed later
        };
        await saveBooking(bookingData);
        successCount++;
    }

    return { successCount };
  } catch (error: any) {
    console.error("Error creating dummy booking:", error);
    return { error: error.message || "An unexpected error occurred." };
  }
}
