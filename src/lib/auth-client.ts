import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    // This MUST point to your backend server's URL
    baseURL: process.env.BACKEND_URL // Or whatever port your dl-backend runs on
});

// We can export common hooks for convenience
export const { signIn, signOut, useSession } = authClient;