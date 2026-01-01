import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    const body = await request.arrayBuffer();
    const endTime = Date.now();
    
    const sizeInBytes = body.byteLength;
    const durationInSeconds = (endTime - startTime) / 1000;
    
    // Return metadata about the upload
    return NextResponse.json({
      success: true,
      size: sizeInBytes,
      duration: durationInSeconds,
      timestamp: endTime,
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}

