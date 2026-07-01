
'use server';

import { cookies } from 'next/headers';
import { verifyAdminCredentials } from '@/lib/firebase';
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import * as z from 'zod';

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function loginAction(values: z.infer<typeof loginSchema>) {
  const validatedFields = loginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: 'Invalid fields' };
  }

  const { username, password } = validatedFields.data;

  try {
    const isValid = await verifyAdminCredentials(username, password);

    if (!isValid) {
      return { success: false, error: 'Invalid username or password' };
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('Login action error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
}
