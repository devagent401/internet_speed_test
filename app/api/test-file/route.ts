import { NextRequest, NextResponse } from 'next/server';

// Generate random data for test file
function generateTestData(sizeInBytes: number): Uint8Array {
  const data = new Uint8Array(sizeInBytes);
  // Fill with pseudo-random data
  for (let i = 0; i < sizeInBytes; i++) {
    data[i] = Math.floor(Math.random() * 256);
  }
  return data;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const size = parseInt(searchParams.get('size') || '20'); // Default 20 MB
  const sizeInBytes = size * 1024 * 1024; // Convert MB to bytes
  
  // Generate test data
  const testData = generateTestData(sizeInBytes);
  
  // Create response with proper headers to prevent caching
  const response = new NextResponse(testData, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': sizeInBytes.toString(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Content-Disposition': `attachment; filename="speedtest-${size}mb.bin"`,
    },
  });
  
  return response;
}

