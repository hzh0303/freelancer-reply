import type { NextRequest } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const UPSTREAM = (process.env.API_UPSTREAM_URL || 'https://api.freelancerreply.com').replace(/\/$/, '');

function rewriteSetCookie(cookie: string) {
  return cookie
    .replace(/;\s*Domain=[^;]*/gi, '')
    .replace(/;\s*SameSite=None/gi, '; SameSite=Lax');
}

async function proxy(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  if (!path?.length) {
    return Response.json({ ok: false, code: 'NOT_FOUND', message: 'API route not found.' }, { status: 404 });
  }

  const target = `${UPSTREAM}/api/${path.join('/')}${req.nextUrl.search}`;
  const headers = new Headers();
  const contentType = req.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  const cookie = req.headers.get('cookie');
  if (cookie) headers.set('cookie', cookie);
  const forwardedFor = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for');
  if (forwardedFor) headers.set('x-forwarded-for', forwardedFor);
  const userAgent = req.headers.get('user-agent');
  if (userAgent) headers.set('user-agent', userAgent);
  headers.set('x-forwarded-host', req.headers.get('host') || '');
  headers.set('x-freelancerreply-proxy', '1');

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: 'manual'
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch {
    return Response.json(
      {
        ok: false,
        code: 'UPSTREAM_UNAVAILABLE',
        message: 'The generator service is temporarily unreachable. Please try again.'
      },
      { status: 503 }
    );
  }

  const responseHeaders = new Headers();
  for (const name of ['content-type', 'cache-control', 'x-api-version', 'x-content-type-options']) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }

  const headerWithCookies = upstream.headers as Headers & { getSetCookie?: () => string[] };
  const cookies =
    typeof headerWithCookies.getSetCookie === 'function'
      ? headerWithCookies.getSetCookie()
      : upstream.headers.get('set-cookie')
        ? [upstream.headers.get('set-cookie') as string]
        : [];
  for (const value of cookies) {
    responseHeaders.append('set-cookie', rewriteSetCookie(value));
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders
  });
}

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(req, context);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(req, context);
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
