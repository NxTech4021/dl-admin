import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { StatsGrid } from "@/components/ui/stats-grid";
import { Button } from "@/components/ui/button";
import {
  IconArrowsExchange,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
  IconX,
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconList,
} from "@tabler/icons-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  useTeamChangeRequests,
  usePendingTeamChangeRequestsCount,
  useProcessTeamChangeRequest,
} from "@/hooks/use-queries";
import { useAdminSession } from "@/hooks/use-admin-session";
import { formatTableDate } from "@/components/data-table/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  TeamChangeRequest,
  TeamChangeRequestStatus,
  getStatusLabel,
  getStatusColor,
} from "@/constants/zod/team-change-request-schema";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect } from "@/components/ui/filter-select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  AnimatedStatsGrid,
  AnimatedStatsCard,
  AnimatedFilterBar,
  AnimatedEmptyState,
} from "@/components/ui/animated-container";
import {
  tableContainerVariants,
  tableRowVariants,
  fastTransition,
} from "@/lib/animation-variants";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "DENIED", label: "Denied" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const Route = createFileRoute("/_authenticated/team-change-requests/")({
  component: TeamChangeRequestsPage,
});

function TeamChangeRequestsPage() {
  const [selectedStatus, setSelectedStatus] = useState<TeamChangeRequestStatus | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<TeamChangeRequest | null>(null);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [processAction, setProcessAction] = useState<"APPROVED" | "DENIED">("APPROVED");
  const [adminNotes, setAdminNotes] = useState("");

  const pageSize = 20;
  const { admin } = useAdminSession();
  const { data: requests, isLoading, error, refetch } = useTeamChangeRequests({
    status: selectedStatus,
  });
  const { data: pendingCount } = usePendingTeamChangeRequestsCount();
  const processRequest = useProcessTeamChangeRequest();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleProcess = (request: TeamChangeRequest, action: "APPROVED" | "DENIED") => {
    setSelectedRequest(request);
    setProcessAction(action);
    setAdminNotes("");
    setProcessDialogOpen(true);
  };

  const confirmProcess = async () => {
    if (!selectedRequest || !admin?.id) return;

    try {
      await processRequest.mutateAsync({
        requestId: selectedRequest.id,
        status: processAction,
        adminId: admin.id,
        adminNotes: adminNotes || undefined,
      });

      toast.success(
        processAction === "APPROVED"
          ? "Request approved successfully"
          : "Request denied successfully"
      );
      setProcessDialogOpen(false);
      refetch();
    } catch {
      toast.error("Failed to process request");
    }
  };

  const filteredRequests = requests || [];
  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <PageHeader
            icon={IconArrowsExchange}
            title="Team Change Requests"
            description="Review and process player division transfer requests"
            actions={
              <>
                {pendingCount !== undefined && pendingCount > 0 && (
                  <Badge variant="destructive">{pendingCount} pending</Badge>
                )}
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <IconRefresh className="mr-2 size-4" />
                  Refresh
                </Button>
              </>
            }
          >
            <AnimatedStatsGrid className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <AnimatedStatsCard>
                <StatsCard
                  title="Pending Requests"
                  value={requests?.filter((r) => r.status === "PENDING").length || 0}
                  description="Awaiting review"
                  icon={IconClock}
                  iconColor="text-yellow-500"
                  loading={isLoading}
                />
              </AnimatedStatsCard>
              <AnimatedStatsCard>
                <StatsCard
                  title="Approved"
                  value={requests?.filter((r) => r.status === "APPROVED").length || 0}
                  description="Transfers completed"
                  icon={IconCircleCheck}
                  iconColor="text-green-500"
                  loading={isLoading}
                />
              </AnimatedStatsCard>
              <AnimatedStatsCard>
                <StatsCard
                  title="Denied"
                  value={requests?.filter((r) => r.status === "DENIED").length || 0}
                  description="Requests rejected"
                  icon={IconCircleX}
                  iconColor="text-red-500"
                  loading={isLoading}
                />
              </AnimatedStatsCard>
              <AnimatedStatsCard>
                <StatsCard
                  title="Total Requests"
                  value={requests?.length || 0}
                  description="All time requests"
                  icon={IconList}
                  iconColor="text-slate-500"
                  loading={isLoading}
                />
              </AnimatedStatsCard>
            </AnimatedStatsGrid>

            <AnimatedFilterBar>
              <FilterBar
                onClearAll={() => {
                  setSelectedStatus(undefined);
                  setCurrentPage(1);
                }}
                showClearButton={!!selectedStatus}
              >
                <FilterSelect
                  value={selectedStatus}
                  onChange={(value) => {
                    setSelectedStatus(value as TeamChangeRequestStatus | undefined);
                    setCurrentPage(1);
                  }}
                  options={STATUS_OPTIONS}
                  allLabel="All Statuses"
                  triggerClassName="w-[180px]"
                />
              </FilterBar>
            </AnimatedFilterBar>
          </PageHeader>

          <div className="flex-1 px-4 lg:px-6 pb-6">
            <div className="rounded-lg border bg-card">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <IconArrowsExchange className="size-12 text-destructive mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Failed to Load Requests</h3>
                  <Button variant="outline" onClick={() => refetch()} className="gap-2">
                    <IconRefresh className="size-4" />
                    Retry
                  </Button>
                </div>
              ) : paginatedRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="w-[50px] text-center">#</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Current Division</TableHead>
                      <TableHead>Requested Division</TableHead>
                      <TableHead>Season</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <motion.tbody
                    initial="hidden"
                    animate="visible"
                    variants={tableContainerVariants}
                  >
                    {paginatedRequests.map((request, index) => (
                      <motion.tr
                        key={request.id}
                        variants={tableRowVariants}
                        transition={fastTransition}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <TableCell className="text-center text-muted-foreground font-mono text-sm">
                          {(currentPage - 1) * pageSize + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarImage src={request.user?.image || undefined} />
                              <AvatarFallback className="text-xs">
                                {getInitials(request.user?.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {request.user?.name || "Unknown"}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{request.currentDivision?.name || "Unknown"}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-primary">
                            {request.requestedDivision?.name || "Unknown"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {request.season?.name || "Unknown"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(request.status)}>
                            {getStatusLabel(request.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatTableDate(request.createdAt)}
                        </TableCell>
                        <TableCell>
                          {request.status === "PENDING" && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                                onClick={() => handleProcess(request, "APPROVED")}
                              >
                                <IconCheck className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                                onClick={() => handleProcess(request, "DENIED")}
                              >
                                <IconX className="size-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </Table>
              ) : (
                <AnimatedEmptyState>
                  <div className="text-center py-12">
                    <IconArrowsExchange className="size-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Requests Found</h3>
                    <p className="text-sm text-muted-foreground">
                      There are no team change requests to review at this time.
                    </p>
                  </div>
                </AnimatedEmptyState>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, filteredRequests.length)} of{" "}
                    {filteredRequests.length} requests
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <IconChevronLeft className="size-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <IconChevronRight className="size-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {processAction === "APPROVED" ? "Approve" : "Deny"} Request
            </DialogTitle>
            <DialogDescription>
              {processAction === "APPROVED"
                ? `This will transfer ${selectedRequest?.user?.name || "the player"} to ${selectedRequest?.requestedDivision?.name}.`
                : `This will deny ${selectedRequest?.user?.name || "the player"}'s request.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="admin-notes">Admin Notes (optional)</Label>
              <Textarea
                id="admin-notes"
                placeholder="Add any notes about this decision..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={processAction === "APPROVED" ? "default" : "destructive"}
              onClick={confirmProcess}
              disabled={processRequest.isPending}
            >
              {processRequest.isPending ? "Processing..." : processAction === "APPROVED" ? "Approve" : "Deny"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
