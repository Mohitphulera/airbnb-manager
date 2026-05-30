'use server'

import { signIn, signOut } from '@/lib/auth'
import { AuthError } from 'next-auth'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// ─── Login (server action) ────────────────────────────────────────────────────
// Uses server-side signIn with redirectTo — the recommended NextAuth v5 pattern.
// On success: Next.js throws a NEXT_REDIRECT internally (must be re-thrown).
// On wrong password: returns { error } for the UI to display.
export async function loginAction(prevState: any, formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  try {
    await signIn('credentials', { email, password, redirectTo: '/admin' })
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: 'Invalid email or password. Please try again.' }
    }
    throw err // Re-throw NEXT_REDIRECT and other internal errors
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logoutAction() {
  try {
    await signOut({ redirectTo: '/login' })
  } catch (err) {
    throw err // Re-throw NEXT_REDIRECT
  }
}

// ─── Register ─────────────────────────────────────────────────────────────────
export async function registerAction(formData: FormData) {
  const email = (formData.get('email') as string).toLowerCase().trim()
  const password = formData.get('password') as string
  const businessName = (formData.get('businessName') as string).trim()
  const rawSlug = (formData.get('slug') as string).toLowerCase().trim()

  // Validate slug format
  const slug = rawSlug.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  if (slug.length < 3 || slug.length > 30) {
    return { error: 'Slug must be 3–30 characters' }
  }

  // Check uniqueness
  const [existingEmail, existingSlug] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { slug } }),
  ])
  if (existingEmail) return { error: 'An account with this email already exists' }
  if (existingSlug) return { error: 'This URL slug is already taken — try another' }

  if (password.length < 6) return { error: 'Password must be at least 6 characters' }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: { email, passwordHash, businessName, slug },
  })

  return { success: true }
}

// ─── Check slug availability ──────────────────────────────────────────────────
export async function checkSlugAvailability(slug: string): Promise<{ available: boolean }> {
  const clean = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  if (clean.length < 3) return { available: false }
  const existing = await prisma.user.findUnique({ where: { slug: clean } })
  return { available: !existing }
}

// ─── Update profile settings ──────────────────────────────────────────────────
export async function updateProfileAction(userId: string, data: {
  businessName?: string
  whatsappNumber?: string
  logoUrl?: string
}) {
  await prisma.user.update({ where: { id: userId }, data })
  revalidatePath('/admin/settings')
  revalidatePath('/admin')
  return { success: true }
}
