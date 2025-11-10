import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // List of suspicious patterns commonly used in attacks
  const suspiciousPatterns = [
    // PHP files (your site is Next.js, not PHP)
    /\.php$/i,

    // WordPress paths (not a WordPress site)
    /^\/wp-admin/i,
    /^\/wp-content/i,
    /^\/wp-includes/i,
    /^\/wp-json/i,

    // Common malicious file names
    /\/(alfa|c99|r57|shell|webshell|backdoor|uploader|hack|pwnd)[\w-]*\.(php|txt|html)/i,

    // Common exploit attempts
    /\/(config|setup|install|phpinfo|adminer|phpmyadmin)/i,
    /\/(cgi-bin|\.env|\.git|\.svn)/i,

    // Suspicious query parameters
    /[?&](exec|cmd|command|shell|query|code|debug|eval)/i,
  ];

  // Check if the pathname matches any suspicious pattern
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(pathname));

  if (isSuspicious) {
    // Return a proper 404 response with minimal content
    return new NextResponse(null, {
      status: 404,
      statusText: 'Not Found',
    });
  }

  // Allow legitimate requests to proceed
  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)',
  ],
};
