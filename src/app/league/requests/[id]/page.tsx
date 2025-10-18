"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  IconUsers, 
  IconArrowLeft, 
  IconCheck, 
  IconX, 
  IconEye,
  IconMail,
  IconCalendar,
  IconTrophy,
  IconStar,
  IconMapPin,
  IconClock,
  IconUserCheck,
  IconUserX,
  IconFilter,
  IconSearch,
  IconRefresh
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
 

interface JoinRequest {
  id: string;
  playerId: string;
  playerName: string;
  playerEmail: string;
  playerRating: number;
  playerLocation: string;
  requestDate: string;
  status: "pending" | "approved" | "denied";
  message?: string;
  adminNotes?: string;
  denialReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

interface League {
  id: string;
  name: string;
  sport: string;
  location: string;
  status: string;
  playerCount: number;
  maxPlayers: number;
  pendingRequests: number;
}

// Mock league lookup by id to reflect URL param
const mockLeaguesById: Record<string, League> = {
  "1": { id: "1", name: "KL Tennis Championship", sport: "tennis", location: "Kuala Lumpur", status: "registration", playerCount: 24, maxPlayers: 32, pendingRequests: 5 },
  "2": { id: "2", name: "PJ Tennis League", sport: "tennis", location: "Petaling Jaya", status: "registration", playerCount: 16, maxPlayers: 24, pendingRequests: 8 },
  "3": { id: "3", name: "Subang Table Tennis Pro", sport: "table-tennis", location: "Subang Jaya", status: "completed", playerCount: 28, maxPlayers: 28, pendingRequests: 0 },
};

const mockRequests: JoinRequest[] = [
  {
    id: "req-1",
    playerId: "player-1",
    playerName: "John Doe",
    playerEmail: "john.doe@example.com",
    playerRating: 4.2,
    playerLocation: "Kuala Lumpur",
    requestDate: "2024-01-15T10:30:00Z",
    status: "pending",
    message: "I'm excited to join this league and improve my tennis skills!",
  },
  {
    id: "req-2",
    playerId: "player-2",
    playerName: "Jane Smith",
    playerEmail: "jane.smith@example.com",
    playerRating: 3.8,
    playerLocation: "Petaling Jaya",
    requestDate: "2024-01-14T14:20:00Z",
    status: "pending",
    message: "Looking forward to competitive matches in this league.",
  },
  {
    id: "req-3",
    playerId: "player-3",
    playerName: "Mike Johnson",
    playerEmail: "mike.johnson@example.com",
    playerRating: 4.5,
    playerLocation: "Kuala Lumpur",
    requestDate: "2024-01-13T09:15:00Z",
    status: "approved",
    reviewedBy: "Admin User",
    reviewedAt: "2024-01-13T16:30:00Z",
  },
  {
    id: "req-4",
    playerId: "player-4",
    playerName: "Sarah Wilson",
    playerEmail: "sarah.wilson@example.com",
    playerRating: 2.5,
    playerLocation: "Shah Alam",
    requestDate: "2024-01-12T11:45:00Z",
    status: "denied",
    denialReason: "Rating below league minimum requirement",
    reviewedBy: "Admin User",
    reviewedAt: "2024-01-12T17:20:00Z",
  },
  {
    id: "req-5",
    playerId: "player-5",
    playerName: "David Lee",
    playerEmail: "david.lee@example.com",
    playerRating: 4.0,
    playerLocation: "Subang Jaya",
    requestDate: "2024-01-11T16:00:00Z",
    status: "pending",
    message: "I have 5 years of competitive tennis experience.",
  },
];

export default function LeagueJoinRequestsPage() {
  const router = useRouter();
  const params = useParams();
  const leagueId = params.id as string;

  const [league, setLeague] = useState<League | null>(null);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  const [denialReason, setDenialReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDenialDialog, setShowDenialDialog] = useState(false);

  // Load league and requests data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const resolvedLeague = mockLeaguesById[leagueId] ?? null;
        setLeague(resolvedLeague);
        setRequests(mockRequests);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load join requests");
      } finally {
        setIsLoading(false);
      }
    };

    if (leagueId) {
      loadData();
    }
  }, [leagueId]);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.playerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingRequests = requests.filter(r => r.status === "pending");
  const approvedRequests = requests.filter(r => r.status === "approved");
  const deniedRequests = requests.filter(r => r.status === "denied");

  const handleApprove = async (request: JoinRequest) => {
    setIsProcessing(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRequests(prev => prev.map(r => 
        r.id === request.id 
          ? { 
              ...r, 
              status: "approved" as const,
              reviewedBy: "Admin User",
              reviewedAt: new Date().toISOString(),
              adminNotes 
            }
          : r
      ));
      
      toast.success(`Approved ${request.playerName}'s join request`);
      setAdminNotes("");
    } catch (error) {
      toast.error("Failed to approve request");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeny = async (request: JoinRequest) => {
    if (!denialReason.trim()) {
      toast.error("Please provide a reason for denial");
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRequests(prev => prev.map(r => 
        r.id === request.id 
          ? { 
              ...r, 
              status: "denied" as const,
              denialReason: denialReason.trim(),
              reviewedBy: "Admin User",
              reviewedAt: new Date().toISOString(),
              adminNotes 
            }
          : r
      ));
      
      toast.success(`Denied ${request.playerName}'s join request`);
      setDenialReason("");
      setAdminNotes("");
      setShowDenialDialog(false);
      setSelectedRequest(null);
    } catch (error) {
      toast.error("Failed to deny request");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkApprove = async () => {
    const pendingIds = pendingRequests.map(r => r.id);
    if (pendingIds.length === 0) {
      toast.info("No pending requests to approve");
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setRequests(prev => prev.map(r => 
        r.status === "pending" 
          ? { 
              ...r, 
              status: "approved" as const,
              reviewedBy: "Admin User",
              reviewedAt: new Date().toISOString()
            }
          : r
      ));
      
      toast.success(`Approved ${pendingIds.length} join requests`);
    } catch (error) {
      toast.error("Failed to approve requests");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case "denied":
        return <Badge variant="destructive">Denied</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Loading join requests...</span>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader items={[{ label: "League", href: "/league" }, { label: league ? league.name : "Details", href: `/league/view/${leagueId}` }, { label: "Requests" }]} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6">
              {/* Page Header */}
              <div className="border-b bg-gradient-to-r from-background/95 to-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-4 lg:px-6 py-8">
                  <div className="flex flex-col gap-6">
                    
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.back()}
                      >
                        <IconArrowLeft className="size-4 mr-2" />
                        Back
                      </Button>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconUsers className="size-8 text-primary" />
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold tracking-tight">Join Requests</h1>
                          <p className="text-muted-foreground">
                            {league?.name} - Manage player join requests
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="flex-1 px-4 lg:px-6 py-6">
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2">
                          <IconClock className="size-5 text-yellow-500" />
                          <div>
                            <p className="text-2xl font-bold">{pendingRequests.length}</p>
                            <p className="text-sm text-muted-foreground">Pending</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2">
                          <IconUserCheck className="size-5 text-green-500" />
                          <div>
                            <p className="text-2xl font-bold">{approvedRequests.length}</p>
                            <p className="text-sm text-muted-foreground">Approved</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2">
                          <IconUserX className="size-5 text-red-500" />
                          <div>
                            <p className="text-2xl font-bold">{deniedRequests.length}</p>
                            <p className="text-sm text-muted-foreground">Denied</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2">
                          <IconUsers className="size-5 text-blue-500" />
                          <div>
                            <p className="text-2xl font-bold">{requests.length}</p>
                            <p className="text-sm text-muted-foreground">Total</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Actions and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search players..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8 w-64"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="denied">Denied</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                      >
                        <IconRefresh className="size-4 mr-2" />
                        Refresh
                      </Button>
                      {pendingRequests.length > 0 && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button>
                              <IconCheck className="size-4 mr-2" />
                              Approve All Pending
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Approve All Pending Requests</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to approve all {pendingRequests.length} pending join requests?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleBulkApprove}>
                                Approve All
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>

                  {/* Requests Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Join Requests</CardTitle>
                      <CardDescription>
                        Review and manage player join requests for this league
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {filteredRequests.length === 0 ? (
                        <div className="text-center py-12">
                          <IconUsers className="size-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No requests found</h3>
                          <p className="text-muted-foreground">
                            {searchTerm || statusFilter !== "all" 
                              ? "No requests match your current filters"
                              : "No join requests have been submitted yet"
                            }
                          </p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Player</TableHead>
                              <TableHead>Rating</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Request Date</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredRequests.map((request) => (
                              <TableRow key={request.id}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{request.playerName}</div>
                                    <div className="text-sm text-muted-foreground">{request.playerEmail}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <IconStar className="size-4 text-yellow-500" />
                                    <span>{request.playerRating}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <IconMapPin className="size-4 text-muted-foreground" />
                                    <span>{request.playerLocation}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <IconCalendar className="size-4 text-muted-foreground" />
                                    <span className="text-sm">{formatDate(request.requestDate)}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(request.status)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                          <IconEye className="size-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                          <DialogTitle>Join Request Details</DialogTitle>
                                          <DialogDescription>
                                            Review {request.playerName}'s request to join the league
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <Label className="text-sm font-medium">Player Name</Label>
                                              <p className="text-sm">{request.playerName}</p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium">Email</Label>
                                              <p className="text-sm">{request.playerEmail}</p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium">Rating</Label>
                                              <p className="text-sm flex items-center gap-1">
                                                <IconStar className="size-4 text-yellow-500" />
                                                {request.playerRating}
                                              </p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium">Location</Label>
                                              <p className="text-sm">{request.playerLocation}</p>
                                            </div>
                                          </div>
                                          
                                          {request.message && (
                                            <div>
                                              <Label className="text-sm font-medium">Player Message</Label>
                                              <p className="text-sm bg-muted p-3 rounded-md mt-1">{request.message}</p>
                                            </div>
                                          )}

                                          {request.status !== "pending" && (
                                            <div className="space-y-2">
                                              <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                  <Label className="text-sm font-medium">Reviewed By</Label>
                                                  <p className="text-sm">{request.reviewedBy}</p>
                                                </div>
                                                <div>
                                                  <Label className="text-sm font-medium">Reviewed At</Label>
                                                  <p className="text-sm">{request.reviewedAt && formatDate(request.reviewedAt)}</p>
                                                </div>
                                              </div>
                                              
                                              {request.denialReason && (
                                                <div>
                                                  <Label className="text-sm font-medium">Denial Reason</Label>
                                                  <p className="text-sm bg-red-50 p-3 rounded-md mt-1">{request.denialReason}</p>
                                                </div>
                                              )}
                                              
                                              {request.adminNotes && (
                                                <div>
                                                  <Label className="text-sm font-medium">Admin Notes</Label>
                                                  <p className="text-sm bg-muted p-3 rounded-md mt-1">{request.adminNotes}</p>
                                                </div>
                                              )}
                                            </div>
                                          )}

                                          {request.status === "pending" && (
                                            <div>
                                              <Label htmlFor="adminNotes" className="text-sm font-medium">
                                                Admin Notes (Optional)
                                              </Label>
                                              <Textarea
                                                id="adminNotes"
                                                placeholder="Add any notes about this request..."
                                                value={adminNotes}
                                                onChange={(e) => setAdminNotes(e.target.value)}
                                                className="mt-1"
                                              />
                                            </div>
                                          )}
                                        </div>
                                        
                                        {request.status === "pending" && (
                                          <DialogFooter>
                                            <Button
                                              variant="destructive"
                                              onClick={() => {
                                                setSelectedRequest(request);
                                                setShowDenialDialog(true);
                                              }}
                                              disabled={isProcessing}
                                            >
                                              <IconX className="size-4 mr-2" />
                                              Deny
                                            </Button>
                                            <Button
                                              onClick={() => handleApprove(request)}
                                              disabled={isProcessing}
                                            >
                                              {isProcessing ? (
                                                <div className="flex items-center gap-2">
                                                  <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                  Processing...
                                                </div>
                                              ) : (
                                                <>
                                                  <IconCheck className="size-4 mr-2" />
                                                  Approve
                                                </>
                                              )}
                                            </Button>
                                          </DialogFooter>
                                        )}
                                      </DialogContent>
                                    </Dialog>
                                    
                                    {request.status === "pending" && (
                                      <>
                                        <Button
                                          size="sm"
                                          onClick={() => handleApprove(request)}
                                          disabled={isProcessing}
                                        >
                                          <IconCheck className="size-4" />
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedRequest(request);
                                            setShowDenialDialog(true);
                                          }}
                                          disabled={isProcessing}
                                        >
                                          <IconX className="size-4" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Denial Dialog */}
        <Dialog open={showDenialDialog} onOpenChange={setShowDenialDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deny Join Request</DialogTitle>
              <DialogDescription>
                Please provide a reason for denying {selectedRequest?.playerName}'s request
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="denialReason" className="text-sm font-medium">
                  Reason for Denial <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="denialReason"
                  placeholder="Enter the reason for denial..."
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="adminNotesForDenial" className="text-sm font-medium">
                  Admin Notes (Optional)
                </Label>
                <Textarea
                  id="adminNotesForDenial"
                  placeholder="Add any internal notes..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDenialDialog(false);
                  setDenialReason("");
                  setAdminNotes("");
                  setSelectedRequest(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedRequest && handleDeny(selectedRequest)}
                disabled={!denialReason.trim() || isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Processing...
                  </div>
                ) : (
                  <>
                    <IconX className="size-4 mr-2" />
                    Deny Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
