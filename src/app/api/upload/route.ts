import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Cloudinary config must be inside the request handler for serverless environments
export async function POST(request: Request) {
  if (!process.env.CLOUDINARY_API_SECRET) {
    console.error("Missing CLOUDINARY_API_SECRET")
    return NextResponse.json({ error: 'Server misconfiguration: API Secret missing' }, { status: 500 })
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

  const urls: string[] = []

  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    try {
      // Uploading from memory directly to Cloudinary via a stream buffer
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'airbnb-manager' }, 
          (error, result) => {
            if (error) reject(error)
            else resolve(result?.secure_url)
          }
        ).end(buffer)
      })

      urls.push(uploadResult as string)
    } catch (error) {
      console.error("Cloudinary upload error:", error)
      return NextResponse.json({ error: 'Failed to upload to cloud' }, { status: 500 })
    }
  }

  return NextResponse.json({ urls })
}
