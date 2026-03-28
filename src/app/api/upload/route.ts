import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB per file
const MAX_FILES_PER_REQUEST = 5 // max files in a single request (client sends 1 at a time)

// Upload a single buffer to Cloudinary and return the optimized URL
function uploadToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'airbnb-manager',
        resource_type: 'image',
        format: 'jpg',        // Force JPEG output — handles HEIC, HEIF, WebP, etc.
        quality: 'auto:good',  // Cloudinary auto-quality
      },
      (error, result) => {
        if (error) reject(error)
        else {
          const url = result?.secure_url || ''
          resolve(url)
        }
      }
    ).end(buffer)
  })
}

export async function POST(request: Request) {
  if (!process.env.CLOUDINARY_API_SECRET) {
    console.error('Missing CLOUDINARY_API_SECRET')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  const formData = await request.formData()
  const files = formData.getAll('files') as File[]

  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }

  if (files.length > MAX_FILES_PER_REQUEST) {
    return NextResponse.json({ error: `Maximum ${MAX_FILES_PER_REQUEST} files per request` }, { status: 400 })
  }

  // Validate file sizes
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File "${file.name}" exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)` },
        { status: 400 }
      )
    }
  }

  // Upload all files in parallel for speed
  try {
    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      return uploadToCloudinary(buffer)
    })

    const urls = await Promise.all(uploadPromises)
    return NextResponse.json({ urls })
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return NextResponse.json({ error: 'Failed to upload to cloud' }, { status: 500 })
  }
}
