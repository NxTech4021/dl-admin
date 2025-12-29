'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { tableContainerVariants, tableRowVariants, fastTransition } from '@/lib/animation-variants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  IconFileText,
  IconCheck,
  IconX,
  IconClock,
  IconAlertCircle,
  IconEye,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import { WithdrawalRequest } from '@/constants/zod/season-schema';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import axiosInstance, { endpoints } from '@/lib/endpoints';

interface WithdrawalRequestsCardProps {
  requests: WithdrawalRequest[];
  onRequestProcessed?: () => Promise<void>;
}

// Helper functions
const getInitials = (name: string | null | undefined): string => {
  if (!name) return '??';
  return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
};

const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '—';
  const dateObject = date instanceof Date ? date : new Date(date);
  return dateObject.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatRelativeDate = (date: Date | string | null | undefined): string => {
  if (!date) return '—';
  const dateObject = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - dateObject.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateObject);
};

const truncateText = (text: string, maxLength: number = 40): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const getAvatarColor = (name: string | null | undefined): string => {
  const colors = [
    'bg-slate-600',
    'bg-emerald-600',
    'bg-sky-600',
    'bg-violet-600',
    'bg-amber-600',
    'bg-rose-600',
    'bg-teal-600',
    'bg-indigo-600',
  ];
  if (!name) return colors[0];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
    case 'APPROVED':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
    case 'REJECTED':
      return 'text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <IconClock className="size-3" />;
    case 'APPROVED':
      return <IconCheck className="size-3" />;
    case 'REJECTED':
      return <IconX className="size-3" />;
    default:
      return null;
  }
};

export default function WithdrawalRequestsCard({ requests, onRequestProcessed }: WithdrawalRequestsCardProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter requests by status
  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const approvedRequests = requests.filter(r => r.status === 'APPROVED');
  const rejectedRequests = requests.filter(r => r.status === 'REJECTED');

  // Get current tab's requests
  const getTabRequests = () => {
    switch (activeTab) {
      case 'pending':
        return pendingRequests;
      case 'approved':
        return approvedRequests;
      case 'rejected':
        return rejectedRequests;
      default:
        return requests;
    }
  };

  // Filter by search query
  const filteredRequests = useMemo(() => {
    let result = getTabRequests();

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((r) => {
        const name = r.user?.name?.toLowerCase() || '';
        const email = r.user?.email?.toLowerCase() || '';
        const reason = r.reason?.toLowerCase() || '';
        return name.includes(query) || email.includes(query) || reason.includes(query);
      });
    }

    return result;
  }, [requests, activeTab, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset page when tab or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const handleApprove = async (requestId: string) => {
    setIsProcessing(requestId);
    try {
      await axiosInstance.put(endpoints.withdrawal.process(requestId), {
        status: 'APPROVED',
      });
      toast.success('Withdrawal request approved successfully');
      onRequestProcessed?.();
    } catch (error) {
      console.error('Failed to approve withdrawal:', error);
      toast.error('Failed to approve withdrawal request');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setIsProcessing(requestId);
    try {
      await axiosInstance.put(endpoints.withdrawal.process(requestId), {
        status: 'REJECTED',
      });
      toast.success('Withdrawal request rejected');
      onRequestProcessed?.();
    } catch (error) {
      console.error('Failed to reject withdrawal:', error);
      toast.error('Failed to reject withdrawal request');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleViewDetails = (request: WithdrawalRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
  };

  const RequestTable = ({ requests: tableRequests }: { requests: WithdrawalRequest[] }) => (
    <div className="rounded-lg border bg-card">
      {tableRequests.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[50px] py-2.5 pl-4 font-medium text-xs">#</TableHead>
              <TableHead className="py-2.5 font-medium text-xs min-w-[200px]">Player</TableHead>
              <TableHead className="py-2.5 font-medium text-xs min-w-[200px]">Reason</TableHead>
              <TableHead className="w-[120px] py-2.5 font-medium text-xs">Request Date</TableHead>
              <TableHead className="w-[100px] py-2.5 font-medium text-xs">Status</TableHead>
              <TableHead className="w-[140px] py-2.5 font-medium text-xs">Processed By</TableHead>
              <TableHead className="w-[160px] py-2.5 pr-4 font-medium text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <motion.tbody
            key={`${activeTab}-${searchQuery}-${currentPage}`}
            initial="hidden"
            animate="visible"
            variants={tableContainerVariants}
          >
            {tableRequests.map((request, index) => (
              <motion.tr
                key={request.id}
                variants={tableRowVariants}
                transition={fastTransition}
                className="hover:bg-muted/30 border-b transition-colors"
              >
                {/* Row Number */}
                <TableCell className="py-3 pl-4 text-sm text-muted-foreground">
                  {((currentPage - 1) * pageSize) + index + 1}
                </TableCell>

                {/* Player */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8 ring-2 ring-background">
                      {request.user?.image && (
                        <AvatarImage src={request.user.image} alt={request.user?.name || 'User'} />
                      )}
                      <AvatarFallback className={`text-white font-semibold text-[10px] ${getAvatarColor(request.user?.name || request.userId)}`}>
                        {getInitials(request.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {request.user?.name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {request.user?.email || (request.userId ? `ID: ${request.userId.slice(0, 8)}...` : '—')}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Reason */}
                <TableCell className="py-3">
                  <p className="text-sm truncate max-w-[200px]" title={request.reason}>
                    {truncateText(request.reason)}
                  </p>
                </TableCell>

                {/* Request Date */}
                <TableCell className="py-3 text-sm text-muted-foreground">
                  {formatRelativeDate(request.requestDate || request.createdAt)}
                </TableCell>

                {/* Status */}
                <TableCell className="py-3">
                  <Badge
                    variant="outline"
                    className={cn('text-xs font-medium border flex items-center gap-1 w-fit', getStatusBadgeClass(request.status))}
                  >
                    {getStatusIcon(request.status)}
                    {request.status.charAt(0) + request.status.slice(1).toLowerCase()}
                  </Badge>
                </TableCell>

                {/* Processed By */}
                <TableCell className="py-3">
                  {request.processedByAdmin ? (
                    <div className="text-sm">
                      <p className="font-medium truncate">{request.processedByAdmin.name || '—'}</p>
                      {request.updatedAt && (
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeDate(request.updatedAt)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell className="py-3 pr-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {request.status === 'PENDING' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400"
                          onClick={() => handleApprove(request.id)}
                          disabled={isProcessing === request.id}
                        >
                          <IconCheck className="size-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400"
                          onClick={() => handleReject(request.id)}
                          disabled={isProcessing === request.id}
                        >
                          <IconX className="size-3 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:bg-muted"
                      onClick={() => handleViewDetails(request)}
                    >
                      <IconEye className="size-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </motion.tbody>
        </Table>
      ) : (
        <div className="text-center py-16">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
              <IconAlertCircle className="size-6 opacity-50" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">No withdrawal requests found</p>
              <p className="text-xs">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'No withdrawal requests in this category'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && tableRequests.length > 0 && (
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredRequests.length)} of {filteredRequests.length} requests
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
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
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
  );

  return (
    <>
      <div className="space-y-4">
        {/* Header with title and search */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <IconAlertCircle className="size-5" />
            <span className="text-lg font-semibold">
              Withdrawal Requests ({pendingRequests.length} Pending)
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 pl-9 pr-9 h-9"
              />
              {searchQuery && (
                <button
                  onClick={clearFilters}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <IconX className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All ({requests.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <RequestTable requests={paginatedRequests} />
          </TabsContent>

          <TabsContent value="pending" className="mt-0">
            <RequestTable requests={paginatedRequests} />
          </TabsContent>

          <TabsContent value="approved" className="mt-0">
            <RequestTable requests={paginatedRequests} />
          </TabsContent>

          <TabsContent value="rejected" className="mt-0">
            <RequestTable requests={paginatedRequests} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconFileText className="size-5" />
              Withdrawal Request Details
            </DialogTitle>
            <DialogDescription>
              Full details of the withdrawal request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {/* Player Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Avatar className="size-10 ring-2 ring-background">
                  <AvatarFallback className={`text-white text-sm font-semibold ${getAvatarColor(selectedRequest.user?.name || selectedRequest.userId)}`}>
                    {getInitials(selectedRequest.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedRequest.user?.name || 'Unknown User'}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedRequest.user?.email || (selectedRequest.userId ? `User ID: ${selectedRequest.userId}` : '—')}
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reason</label>
                  <div className="mt-1 p-3 bg-muted/30 rounded-lg text-sm">
                    {selectedRequest.reason}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Request Date</label>
                    <div className="mt-1 text-sm">
                      {formatDate(selectedRequest.requestDate || selectedRequest.createdAt)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className={cn('text-xs font-medium border flex items-center gap-1 w-fit', getStatusBadgeClass(selectedRequest.status))}
                      >
                        {getStatusIcon(selectedRequest.status)}
                        {selectedRequest.status.charAt(0) + selectedRequest.status.slice(1).toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                {selectedRequest.processedByAdmin && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Processed By</label>
                    <div className="mt-1 text-sm">
                      <div className="font-medium">{selectedRequest.processedByAdmin.name}</div>
                      {selectedRequest.updatedAt && (
                        <div className="text-muted-foreground">
                          {formatDate(selectedRequest.updatedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions for pending requests */}
              {selectedRequest.status === 'PENDING' && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    className="flex-1 bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300"
                    onClick={() => {
                      handleApprove(selectedRequest.id);
                      setIsModalOpen(false);
                    }}
                    disabled={isProcessing === selectedRequest.id}
                  >
                    <IconCheck className="size-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
                    onClick={() => {
                      handleReject(selectedRequest.id);
                      setIsModalOpen(false);
                    }}
                    disabled={isProcessing === selectedRequest.id}
                  >
                    <IconX className="size-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
