'use server'

import { cookies } from 'next/headers'

export async function loginAction(formData: FormData) {
  const password = formData.get('password') as string
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin'

  if (password === adminPassword) {
    const cookieStore = await cookies()
    cookieStore.set('admin_token', 'authenticated', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    })
    return { success: true }
  } else {
    return { error: 'Invalid password' }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_token')
}
