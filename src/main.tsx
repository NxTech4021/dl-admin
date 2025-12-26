import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { routeTree } from "./routeTree.gen";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/error-boundary";
import { BugReportWidget } from "@/components/bug-report/BugReportWidget";
import { ModalProvider } from "@/contexts/modal-context";
// CommandPalette and GlobalModals are in __root.tsx to be inside Router context
import { useSession } from "@/lib/auth-client";

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: import.meta.env.PROD,
      refetchOnMount: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Create the router
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: {
    auth: undefined!,
    queryClient,
  },
});

// Register the router for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Inner app that has access to auth context
function InnerApp() {
  const { data: session, isPending } = useSession();

  // Don't render router until initial auth check completes
  // This prevents race conditions with protected route guards
  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const auth = {
    isAuthenticated: !!session?.user,
    user: session?.user ?? null,
    session: session,
    isLoading: false, // Always false once we render - auth is loaded
  };

  return <RouterProvider router={router} context={{ auth, queryClient }} />;
}

// Main app component
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ModalProvider>
          <InnerApp />
        </ModalProvider>
      </QueryClientProvider>
      <Toaster position="bottom-right" />
      <BugReportWidget />
    </ErrorBoundary>
  );
}

// Mount the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
