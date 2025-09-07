
'use server';
import { saveBooking } from '@/lib/firebase-server';
import { getOccupiedSeats, getBlockedSeatsForDate } from '@/lib/firebase-server';
import { tourPackages } from '@/lib/data';
import { format } from 'date-fns';

export async function customizeItineraryAction(prevState: any, formData: FormData): Promise<any> {
  // This is a placeholder now that the AI functionality has been removed.
  return { error: 'This feature is no longer available.' };
}


// --- DUMMY BOOKING GENERATOR ---

const firstNames = ["Suresh", "Ramesh", "Priya", "Anjali", "Vikram", "Pooja", "Amit", "Sunita", "Rajesh", "Deepa"];
const lastNames = ["Kumar", "Sharma", "Patel", "Singh", "Gupta", "Reddy", "Menon", "Jain", "Khan", "Verma"];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function generatePassengers(count: number): any[] {
  const passengers = [];
  for (let i = 0; i < count; i++) {
    const age = Math.floor(Math.random() * 50) + 18;
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    passengers.push({
      name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
      age: age,
      gender: gender,
    });
  }
  return passengers;
}

export async function createDummyBooking(packageSlug: string, bookingDate: string, count: number) {
  try {
    const totalSeats = 40;
    const tourPackage = tourPackages.find(p => p.slug === packageSlug);
    if (!tourPackage) return { error: "Tour package not found" };

    const [occupiedSeats, blockedSeats] = await Promise.all([
      getOccupiedSeats(packageSlug, bookingDate),
      getBlockedSeatsForDate(packageSlug, bookingDate)
    ]);

    const unavailableSeats = new Set([...occupiedSeats, ...blockedSeats]);
    const availableSeats = Array.from({ length: totalSeats }, (_, i) => i + 1).filter(seat => !unavailableSeats.has(seat));

    let createdCount = 0;
    for (let i = 0; i < count; i++) {
      const memberCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 members
      if (availableSeats.length < memberCount) {
        // Not enough seats for this new booking, stop.
        break;
      }

      const selectedSeatsForBooking: any[] = [];
      for (let j = 0; j < memberCount; j++) {
        const seatIndex = Math.floor(Math.random() * availableSeats.length);
        const seatNumber = availableSeats.splice(seatIndex, 1)[0];
        const isWindow = seatNumber % 4 === 0 || seatNumber % 4 === 1;
        const price = tourPackage.price + (isWindow ? 50 : 0);
        selectedSeatsForBooking.push({ number: seatNumber, price });
      }

      const totalAmount = selectedSeatsForBooking.reduce((acc, seat) => acc + seat.price, 0);
      const passengers = generatePassengers(memberCount);

      const bookingData = {
        bookingId: `NE-DUMMY-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        packageSlug,
        bookingDate,
        memberCount,
        passengers,
        selectedSeats: selectedSeatsForBooking,
        totalAmount,
        isDummy: true // Flag to identify dummy bookings
      };

      await saveBooking(bookingData);
      createdCount++;
    }

    if(createdCount === 0) {
        return { error: 'No available seats to create dummy bookings.' };
    }

    return { success: `${createdCount} of ${count} requested bookings created.` };

  } catch (error: any) {
    console.error("Dummy booking creation failed:", error);
    return { error: error.message || "Failed to create dummy bookings." };
  }
}

    