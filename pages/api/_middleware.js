import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the origin from the request
  const origin = request.headers.get('origin') || '';
  
  // Define allowed origins
  const allowedOrigins = [
    'https://youthful-vacation-500847.framer.app',
    'https://uptime-status-proxy.vercel.app',
    'http://localhost:3000'
  ];

  // Check if the origin is allowed
  const isAllowedOrigin = allowedOrigins.includes(origin) || origin.endsWith('.framer.app');
  
  // Clone the response
  const response = NextResponse.next();

  // Set CORS headers
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Vary', 'Origin');
  response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=300');
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers
    });
  }

  return response;
}

// Apply this middleware to all API routes
export const config = {
  matcher: '/api/:path*',
};
