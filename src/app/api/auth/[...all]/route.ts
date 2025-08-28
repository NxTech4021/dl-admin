const host = process.env.HOST_URL;

// Proxy auth requests to your backend server
const handler = async (request: Request) => {
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
