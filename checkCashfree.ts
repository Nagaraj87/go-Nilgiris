import { initiateCashfreePayment } from './src/app/(user)/booking/actions';
import type { Booking } from './src/types';

async function test() {
  const bookingData: Omit<Booking, 'id'> = {
    bookingId: '',
    packageSlug: 'mudhumalai-pykara-tour',
    bookingDate: '2026-07-25',
    memberCount: 1,
    totalAmount: 399,
    passengers: [
      {
        name: 'John Doe',
        age: 30,
        gender: 'male',
        phone: '9876543210'
      }
    ],
    selectedSeats: [
      {
        number: 5,
        price: 399
      }
    ],
    paymentStatus: 'PENDING'
  };

  console.log("Initiating payment...");
  const res = await initiateCashfreePayment(bookingData, 399);
  console.log("Result:", res);
}

test().catch(console.error);
