import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

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

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' },
        { status: 400 }
      )
    }

    // In a real application, you would upload to a cloud storage service
    // For now, we'll create a data URL for demonstration
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    return NextResponse.json({
      success: true,
      imageUrl: dataUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })
  } catch (error) {
    console.error('خطأ في رفع الملف:', error)
    return NextResponse.json(
      { error: 'فشل في رفع الملف' },
      { status: 500 }
    )
  }
}
