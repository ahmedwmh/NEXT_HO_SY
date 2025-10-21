import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Check if Supabase is configured
if (!supabase) {
  console.error('❌ Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'uploads'

    if (!file) {
      return NextResponse.json(
        { error: 'لم يتم العثور على ملف' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'يرجى رفع ملفات صور فقط' },
        { status: 400 }
      )
    }

    // Check if Supabase is configured - if not, use fallback
    if (!supabase) {
      console.log('⚠️ Supabase not configured, using fallback method')
      
      // Fallback: Convert to data URL for testing
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      const dataUrl = `data:${file.type};base64,${base64}`
      
      return NextResponse.json({
        success: true,
        url: dataUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        path: `fallback/${file.name}`,
        warning: 'Using fallback method - Supabase not configured'
      })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}_${randomString}.${fileExtension}`
    const filePath = `${folder}/${fileName}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Supabase storage
    console.log('📤 Uploading file to Supabase:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      filePath: filePath,
      folder: folder
    })

    const { data, error } = await supabase.storage
      .from('hospital-files')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ Supabase upload error:', error)
      console.error('❌ Error details:', {
        message: error.message
      })
      return NextResponse.json(
        { 
          error: 'فشل في رفع الملف إلى التخزين السحابي',
          details: error.message
        },
        { status: 500 }
      )
    }

    console.log('✅ File uploaded successfully:', data)

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('hospital-files')
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      path: filePath
    })
  } catch (error) {
    console.error('خطأ في رفع الملف:', error)
    return NextResponse.json(
      { error: 'فشل في رفع الملف' },
      { status: 500 }
    )
  }
}
