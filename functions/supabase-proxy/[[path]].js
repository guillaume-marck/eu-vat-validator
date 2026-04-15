export async function onRequest(context) {
  const { request, params } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
      },
    });
  }

  const pathParts = params.path || [];
  const path = Array.isArray(pathParts) ? pathParts.join('/') : pathParts;
  const url = new URL(request.url);
  const targetUrl = `https://uuteakaaawjjjcslemqo.supabase.co/${path}${url.search}`;

  // Forward headers sauf les headers Cloudflare internes
  const headers = new Headers();
  const skip = new Set(['host', 'cf-connecting-ip', 'cf-ray', 'cf-visitor', 'x-forwarded-for', 'x-forwarded-proto']);
  for (const [key, value] of request.headers.entries()) {
    if (!skip.has(key.toLowerCase())) headers.set(key, value);
  }

  const init = { method: request.method, headers };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
    init.duplex = 'half';
  }

  const response = await fetch(targetUrl, init);

  const resHeaders = new Headers(response.headers);
  resHeaders.set('Access-Control-Allow-Origin', '*');

  return new Response(response.body, {
    status: response.status,
    headers: resHeaders,
  });
}
