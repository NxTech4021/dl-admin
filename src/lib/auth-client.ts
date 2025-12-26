import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // This MUST point to your backend server's URL
  baseURL: import.meta.env.VITE_AUTH_URL,
  basePath: "/api/auth",
  plugins: [usernameClient()],
});

// We can export common hooks for convenience
export const { signIn, signOut, useSession } = authClient;
