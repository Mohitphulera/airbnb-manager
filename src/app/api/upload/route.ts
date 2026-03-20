import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Upload a single buffer to Cloudinary and return the optimized URL
function uploadToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'airbnb-manager', resource_type: 'image' },
      (error, result) => {
        if (error) reject(error)
        else {
          let url = result?.secure_url || ''
          // Auto-format for browser compatibility (HEIC → JPEG, etc.)
          url = url.replace('/upload/', '/upload/f_auto,q_auto/')
          url = url.replace(/\.[^/.]+$/, '.jpg')
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

  // Upload all files in parallel for speed (fixes multi-file timeout)
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
