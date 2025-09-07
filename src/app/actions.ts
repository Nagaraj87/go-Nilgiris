
'use server';

import { getAdminCredentials } from '@/lib/firebase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function authenticate(previousState: { error: string } | undefined, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  try {
    const credentials = await getAdminCredentials();
    if (username === credentials.username && password === credentials.password) {
      cookies().set('session', 'loggedin', { secure: true, httpOnly: true });
    } else {
      return { error: 'Invalid username or password' };
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return { error: 'An unexpected error occurred during authentication.' };
  }
  redirect('/admin');
}

export async function logout() {
    cookies().delete('session');
    redirect('/admin/login');
}
