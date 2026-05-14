import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  
  // Define protected paths that require login
  const isProtected = url.pathname.startsWith('/admin') || 
                      url.pathname.startsWith('/provider') || 
                      url.pathname.startsWith('/dashboard');

  if (isProtected) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      url.pathname = '/sign-in';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/provider/:path*', '/dashboard/:path*'],
};

