export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://basket-map.com",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
};

export function withCORSHeaders(
  body: BodyInit | null,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(body, {
    status,
    headers: {
      ...CORS_HEADERS,
      ...extraHeaders,
    }
  });
} 