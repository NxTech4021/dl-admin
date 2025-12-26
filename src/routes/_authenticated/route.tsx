import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context, location }) => {
    const { auth } = context;

    // Wait for auth loading to complete
    if (auth?.isLoading) {
      await new Promise<void>((resolve) => {
        const checkAuth = () => {
          if (!auth.isLoading) {
            resolve();
          } else {
            setTimeout(checkAuth, 50);
          }
        };
        checkAuth();
      });
    }

    // Redirect to login if not authenticated
    if (!auth?.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
