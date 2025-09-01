import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // This MUST point to your backend server's URL
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL, // Or whatever port your dl-backend runs on
  basePath: "/api/auth",
  plugins: [usernameClient()],
});

// We can export common hooks for convenience
export const { signIn, signOut, useSession } = authClient;
