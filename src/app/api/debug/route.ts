import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🐛 Debug API: GET request received')
  
  const requestInfo = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    timestamp: new Date().toISOString()
  }
  
  console.log('🐛 Debug API: Request info:', requestInfo)
  
  return NextResponse.json({
    message: 'Debug API is working',
    requestInfo,
    timestamp: new Date().toISOString()
  })
}

