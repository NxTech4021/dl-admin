import { createFileRoute, Link } from "@tanstack/react-router";
import { IconChevronLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { AdminProfile } from "@/components/admin-profile";

export const Route = createFileRoute("/_authenticated/admin/$adminId/")({
  component: AdminDetailPage,
});

function AdminDetailPage() {
  const { adminId } = Route.useParams();

  return (
    <>
      <SiteHeader
        items={[
          { label: "Admins", href: "/admin" },
          { label: "Admin Profile" },
        ]}
      />
      <div className="flex flex-1 flex-col p-8">
        {/* Back button and title */}
        <div className="flex items-center gap-4 mb-6">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin">
              <IconChevronLeft className="mr-1 size-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Admin Profile</h1>
            <p className="text-sm text-muted-foreground">
              View and manage admin information
            </p>
          </div>
        </div>

        <div className="flex-1">
          <AdminProfile adminId={adminId} />
        </div>
      </div>
    </>
  );
}
