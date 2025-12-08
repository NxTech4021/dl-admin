const host = process.env.NEXT_PUBLIC_HOST_URL;

// Allowed origins for CSRF protection
const getAllowedOrigins = (): string[] => {
  const origins: string[] = [];

  // Add frontend URL
  if (process.env.NEXT_PUBLIC_AUTH_URL) {
    origins.push(process.env.NEXT_PUBLIC_AUTH_URL);
  }

  // Add localhost variants for development
  if (process.env.NODE_ENV === "development") {
    origins.push(
      "http://localhost:3030",
      "http://127.0.0.1:3030",
      "http://localhost:82"
    );
  }

  return origins;
};

// Validate request origin for CSRF protection
const isValidOrigin = (request: Request): boolean => {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // GET requests don't need CSRF protection
  if (request.method === "GET") {
    return true;
  }

  const allowedOrigins = getAllowedOrigins();

  // Check origin header
  if (origin && allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
    return true;
  }

  // Fallback to referer header
  if (referer && allowedOrigins.some((allowed) => referer.startsWith(allowed))) {
    return true;
  }

  // Allow requests without origin/referer in development (for tools like Postman)
  if (process.env.NODE_ENV === "development" && !origin && !referer) {
    return true;
  }

  return false;
};

// Proxy auth requests to your backend server
const handler = async (request: Request) => {
  // CSRF protection - validate origin
  if (!isValidOrigin(request)) {
    console.warn("CSRF validation failed:", {
      origin: request.headers.get("origin"),
      referer: request.headers.get("referer"),
      method: request.method,
    });
    return new Response(JSON.stringify({ error: "Forbidden - Invalid origin" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(request.url);
  // Replace the frontend URL with your backend URL
  const backendUrl = `${host}${url.pathname}${url.search}`;

  const response = await fetch(backendUrl, {
    method: request.method,
    headers: {
      "Content-Type": request.headers.get("Content-Type") || "application/json",
      Cookie: request.headers.get("Cookie") || "",
      Authorization: request.headers.get("Authorization") || "",
    },
    body: request.method === "POST" ? await request.text() : undefined,
  });

  // Forward the response headers (especially cookies)
  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    responseHeaders.set(key, value);
  });

  return new Response(await response.text(), {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
};

export { handler as GET, handler as POST };
