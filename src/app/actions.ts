'use server';

import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {deleteAllBookings as deleteAllBookingsFromDb} from '@/lib/firebase';

export async function authenticate(prevState: string | undefined, formData: FormData) {
  const username = formData.get('username');
  const password = formData.get('password');

  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    cookies().set('session', 'loggedin', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    redirect('/admin');
  } else {
    return 'Invalid username or password.';
  }
}

export async function logout() {
  cookies().delete('session');
  redirect('/login');
}

export async function deleteAllBookings(prevState: string | undefined, formData: FormData) {
  const username = formData.get('username');
  const password = formData.get('password');

  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return 'Invalid credentials. Deletion cancelled.';
  }

  try {
    await deleteAllBookingsFromDb();
    return 'success';
  } catch (e) {
    console.error(e);
    return 'An error occurred during deletion.';
  }
}
