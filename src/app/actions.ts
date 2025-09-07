
'use server';

import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {deleteAllBookings as deleteAllBookingsFromDb, getAdminCredentials} from '@/lib/firebase';

export async function authenticate(prevState: string | undefined, formData: FormData) {
  const username = formData.get('username');
  const password = formData.get('password');

  try {
    const adminCredentials = await getAdminCredentials();

    if (username === adminCredentials.username && password === adminCredentials.password) {
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
  } catch (error) {
    console.error(error);
    return 'An unexpected error occurred during authentication.'
  }
}

export async function logout() {
  cookies().set('session', '', {expires: new Date(0)});
  redirect('/login');
}

export async function deleteAllBookings(prevState: string | undefined, formData: FormData) {
  const username = formData.get('username');
  const password = formData.get('password');
  
  try {
    const adminCredentials = await getAdminCredentials();

    if (username !== adminCredentials.username || password !== adminCredentials.password) {
      return 'Invalid credentials. Deletion cancelled.';
    }

    await deleteAllBookingsFromDb();
    return 'success';
  } catch (e) {
    console.error(e);
    return 'An error occurred during deletion.';
  }
}
