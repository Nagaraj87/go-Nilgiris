
'use server';

import Razorpay from 'razorpay';
import { randomBytes } from 'crypto';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
    throw new Error('Razorpay API keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables.');
}

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export const createOrder = async (amount: number) => {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  const options = {
    amount: amount * 100, // Amount in the smallest currency unit (paise)
    currency: 'INR',
    receipt: `receipt_${randomBytes(10).toString('hex')}`,
  };

  
  const order = await razorpay.orders.create(options);
  return order;

};
