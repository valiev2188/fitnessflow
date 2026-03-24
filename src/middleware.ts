import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'super-secret-key-for-dev-only-change-me'
);

const PROTECTED_PATHS = ['/dashboard', '/admin', '/onboarding'];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const isProtected = PROTECTED_PATHS.some(path => pathname.startsWith(path));
    if (!isProtected) return NextResponse.next();

    // Check for web session cookie
    const cookieToken = req.cookies.get('fitness_web_token')?.value;

    // Check for Authorization header (Mini App)
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const token = cookieToken || bearerToken;

    if (!token) {
        // Redirect to login page for web access; 401 for API calls
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.next();
    } catch {
        // Token invalid/expired → redirect to login
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }
}

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*', '/onboarding/:path*'],
};
