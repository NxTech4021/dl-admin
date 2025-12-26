import { useMemo, lazy, Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { IconDownload, IconUsers, IconRefresh, IconAlertCircle } from "@tabler/icons-react";
import { useAdmins } from "@/hooks/use-queries";

// Lazy imports for code splitting
const AdminInviteModalWrapper = lazy(() => import("@/components/wrappers/adminmodalwrapper"));
const AdminsDataTable = lazy(() => import("@/components/data-table/admin-data-table").then(mod => ({ default: mod.AdminsDataTable })));

export default function AdminsWrapper() {
  const { data: admins = [], isLoading, isError, error, refetch } = useAdmins();

  // Memoize computed stats
  const stats = useMemo(() => ({
    total: admins.length,
    active: admins.filter((a) => a.status === "ACTIVE").length,
    pending: admins.filter((a) => a.status === "PENDING").length,
  }), [admins]);

  // Error state
  if (isError) {
    return (
      <>
        <SiteHeader />
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <IconAlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Failed to load admins</h3>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "An error occurred while fetching data."}
              </p>
            </div>
            <Button onClick={() => refetch()} variant="outline">
              <IconRefresh className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="px-4 lg:px-6 py-6">
                <div className="flex flex-col gap-6">
                  {/* Title and Description */}
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <IconUsers className="size-8 text-primary" />
                        <h1 className="text-3xl font-bold tracking-tight">Admins</h1>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <IconDownload className="mr-2 size-4" />
                        Export
                      </Button>
                      <Suspense fallback={<div className="h-8 w-24 animate-pulse bg-muted rounded" />}>
                        <AdminInviteModalWrapper />
                      </Suspense>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="flex items-center gap-3 rounded-lg border p-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <IconUsers className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{isLoading ? "-" : stats.total}</p>
                        <p className="text-sm text-muted-foreground">Total Admins</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border p-4">
                      <div className="rounded-full bg-green-500/10 p-2">
                        <div className="size-4 rounded-full bg-green-500"></div>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{isLoading ? "-" : stats.active}</p>
                        <p className="text-sm text-muted-foreground">Active</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border p-4">
                      <div className="rounded-full bg-yellow-500/10 p-2">
                        <div className="size-4 rounded-full bg-yellow-500"></div>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{isLoading ? "-" : stats.pending}</p>
                        <p className="text-sm text-muted-foreground">Pending</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="flex-1">
              <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
                <AdminsDataTable data={admins} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
