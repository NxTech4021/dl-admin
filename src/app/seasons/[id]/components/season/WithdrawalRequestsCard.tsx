'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { tableContainerVariants, tableRowVariants, fastTransition } from '@/lib/animation-variants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  IconUser, 
  IconCalendar, 
  IconFileText, 
  IconCheck, 
  IconX, 
  IconClock,
  IconAlertCircle,
  IconEye
} from '@tabler/icons-react';
import { WithdrawalRequest } from '@/constants/zod/season-schema';
import { toast } from 'sonner';

interface WithdrawalRequestsCardProps {
  requests: WithdrawalRequest[];
}

// Helper functions
const getInitials = (name: string | null | undefined): string => {
  if (!name) return '??';
  return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
};

const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const getAvatarColor = (name: string | null | undefined): string => {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
  if (!name) return colors[0];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDING':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <IconClock className="size-3 mr-1" />
          Pending
        </Badge>
      );
    case 'APPROVED':
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <IconCheck className="size-3 mr-1" />
          Approved
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <IconX className="size-3 mr-1" />
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function WithdrawalRequestsCard({ requests }: WithdrawalRequestsCardProps) {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter requests by status
  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const approvedRequests = requests.filter(r => r.status === 'APPROVED');
  const rejectedRequests = requests.filter(r => r.status === 'REJECTED');

  const handleApprove = (requestId: string) => {
    // TODO: Implement API call
    console.log('Approve request:', requestId);
    toast.success('Withdrawal request approved successfully');
  };

  const handleReject = (requestId: string) => {
    // TODO: Implement API call
    console.log('Reject request:', requestId);
    toast.error('Withdrawal request rejected');
  };

  const handleViewDetails = (request: WithdrawalRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const RequestTable = ({ requests }: { requests: WithdrawalRequest[] }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">
              <div className="flex items-center gap-2">
                <IconUser className="size-4" />
                Player
              </div>
            </TableHead>
            <TableHead className="w-[300px]">
              <div className="flex items-center gap-2">
                <IconFileText className="size-4" />
                Reason
              </div>
            </TableHead>
            <TableHead className="w-[120px]">
              <div className="flex items-center gap-2">
                <IconCalendar className="size-4" />
                Request Date
              </div>
            </TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[150px]">Processed By</TableHead>
            <TableHead className="w-[120px] text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <motion.tbody
          initial="hidden"
          animate="visible"
          variants={tableContainerVariants}
        >
          {requests.length > 0 ? (
            requests.map((request) => (
              <motion.tr
                key={request.id}
                variants={tableRowVariants}
                transition={fastTransition}
                className="hover:bg-muted/50 border-b transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className={`text-white text-xs font-semibold ${getAvatarColor(request.user?.name)}`}>
                        {getInitials(request.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{request.user?.name || 'Unknown User'}</div>
                      <div className="text-xs text-muted-foreground">
                        {request.user?.email || '—'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">
                      {truncateText(request.reason)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatRelativeDate(request.requestDate || request.createdAt)}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(request.status)}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {request.processedByAdmin ? (
                      <div>
                        <div className="font-medium">{request.processedByAdmin.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {request.updatedAt && formatRelativeDate(request.updatedAt)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    {request.status === 'PENDING' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
                          onClick={() => handleApprove(request.id)}
                        >
                          <IconCheck className="size-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
                          onClick={() => handleReject(request.id)}
                        >
                          <IconX className="size-3 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {/* Always show eye icon for all statuses */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-muted"
                      onClick={() => handleViewDetails(request)}
                    >
                      <IconEye className="size-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                  </div>
                </TableCell>
              </motion.tr>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <IconAlertCircle className="size-12 opacity-50" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">No requests found</p>
                    <p className="text-xs">No withdrawal requests in this category</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </motion.tbody>
      </Table>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconAlertCircle className="size-5" />
          Withdrawal Requests ({pendingRequests.length} Pending)
        </CardTitle>
      </CardHeader>
      <CardContent>
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

          <TabsContent value="all">
            <RequestTable requests={requests} />
          </TabsContent>

          <TabsContent value="pending">
            <RequestTable requests={pendingRequests} />
          </TabsContent>

          <TabsContent value="approved">
            <RequestTable requests={approvedRequests} />
          </TabsContent>

          <TabsContent value="rejected">
            <RequestTable requests={rejectedRequests} />
          </TabsContent>
        </Tabs>
      </CardContent>

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
                <Avatar className="size-10">
                  <AvatarFallback className={`text-white text-sm font-semibold ${getAvatarColor(selectedRequest.user?.name)}`}>
                    {getInitials(selectedRequest.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedRequest.user?.name || 'Unknown User'}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedRequest.user?.email || '—'}
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
                      {formatRelativeDate(selectedRequest.requestDate || selectedRequest.createdAt)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedRequest.status)}
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
                          {formatRelativeDate(selectedRequest.updatedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}