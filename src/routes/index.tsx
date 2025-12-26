import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    // If authenticated, redirect to dashboard
    if (context.auth?.isAuthenticated) {
      throw redirect({ to: "/dashboard" });
    }
    // If not authenticated, redirect to login
    throw redirect({ to: "/login" });
  },
});
