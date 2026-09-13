'use server'

import { signIn, signOut } from '@/lib/auth'
import { AuthError } from 'next-auth'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/session'

// Top-level routes a tenant slug must never shadow (/[slug] is a catch-all)
const RESERVED_SLUGS = new Set([
  'admin', 'api', 'login', 'signup', 'logout', 'property', 'properties-for-sale',
  'feedback', 'settings', 'static', '_next', 'favicon.ico', 'robots.txt', 'sitemap.xml',
])

function cleanSlug(raw: string) {
  return raw.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

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
  const email = String(formData.get('email') ?? '').toLowerCase().trim()
  const password = String(formData.get('password') ?? '')
  const businessName = String(formData.get('businessName') ?? '').trim()
  const rawSlug = String(formData.get('slug') ?? '').toLowerCase().trim()

  if (!businessName) return { error: 'Business name is required' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email address' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters' }

  // Validate slug format
  const slug = cleanSlug(rawSlug)
  if (slug.length < 3 || slug.length > 30) {
    return { error: 'Slug must be 3–30 characters' }
  }
  if (RESERVED_SLUGS.has(slug)) {
    return { error: 'This URL is reserved — try another' }
  }

  // Check uniqueness
  const [existingEmail, existingSlug] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { slug } }),
  ])
  if (existingEmail) return { error: 'An account with this email already exists' }
  if (existingSlug) return { error: 'This URL slug is already taken — try another' }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: { email, passwordHash, businessName, slug },
  })

  return { success: true }
}

// ─── Check slug availability ──────────────────────────────────────────────────
export async function checkSlugAvailability(slug: string): Promise<{ available: boolean }> {
  const clean = cleanSlug(slug)
  if (clean.length < 3 || RESERVED_SLUGS.has(clean)) return { available: false }
  const existing = await prisma.user.findUnique({ where: { slug: clean } })
  return { available: !existing }
}

// ─── Update profile settings ──────────────────────────────────────────────────
// The user is always taken from the session — never from a client-supplied id.
export async function updateProfileAction(data: {
  businessName?: string
  whatsappNumber?: string
  logoUrl?: string
}) {
  const user = await requireUser()
  const businessName = data.businessName?.trim()
  if (businessName !== undefined && businessName.length === 0) {
    return { error: 'Business name cannot be empty' }
  }
  const logoUrl = data.logoUrl?.trim()
  if (logoUrl && !/^https:\/\//.test(logoUrl)) {
    return { error: 'Logo must be an https URL' }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(businessName !== undefined && { businessName }),
      ...(data.whatsappNumber !== undefined && { whatsappNumber: data.whatsappNumber.trim() || null }),
      ...(data.logoUrl !== undefined && { logoUrl: logoUrl || null }),
    },
  })
  revalidatePath('/admin', 'layout')
  revalidatePath(`/${user.slug}`)
  return { success: true }
}
