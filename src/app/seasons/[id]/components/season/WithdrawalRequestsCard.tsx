'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { WithdrawalRequest } from '@/ZodSchema/season-schema';
import { toast } from 'sonner';

interface WithdrawalRequestsCardProps {
  requests: WithdrawalRequest[];
}

// Helper functions
const getInitials = (name: string): string => {
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

const getAvatarColor = (name: string): string => {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
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

  // Mock data for demonstration (remove when real data is available)
  const mockRequests: WithdrawalRequest[] = [
    {
      id: 'wr-1',
      userId: 'user-1',
      seasonId: 'season-1',
      reason: 'Medical emergency requiring immediate attention and hospital care',
      requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      user: { name: 'John Smith', email: 'john@example.com' },
    },
    {
      id: 'wr-2',
      userId: 'user-2',
      seasonId: 'season-1',
      reason: 'Personal family matters that require my full attention',
      requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      user: { name: 'Sarah Johnson', email: 'sarah@example.com' },
    },
    {
      id: 'wr-3',
      userId: 'user-3',
      seasonId: 'season-1',
      reason: 'Work relocation to another city',
      requestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'APPROVED',
      processedByAdminId: 'admin-1',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      user: { name: 'Mike Chen', email: 'mike@example.com' },
      processedByAdmin: { name: 'Admin User' },
    },
    {
      id: 'wr-4',
      userId: 'user-4',
      seasonId: 'season-1',
      reason: 'Financial difficulties',
      requestDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: 'REJECTED',
      processedByAdminId: 'admin-1',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      user: { name: 'Emma Davis', email: 'emma@example.com' },
      processedByAdmin: { name: 'Admin User' },
    },
  ];

  // Use mock data if no real requests
  const displayRequests = requests.length > 0 ? requests : mockRequests;
  const displayPendingRequests = displayRequests.filter(r => r.status === 'PENDING');
  const displayApprovedRequests = displayRequests.filter(r => r.status === 'APPROVED');
  const displayRejectedRequests = displayRequests.filter(r => r.status === 'REJECTED');

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
        <TableBody>
          {requests.length > 0 ? (
            requests.map((request) => (
              <TableRow key={request.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className={`text-white text-xs font-semibold ${getAvatarColor(request.user.name)}`}>
                        {getInitials(request.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{request.user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {request.user.email}
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
              </TableRow>
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
        </TableBody>
      </Table>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconAlertCircle className="size-5" />
          Withdrawal Requests ({displayPendingRequests.length} Pending)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All ({displayRequests.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({displayPendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({displayApprovedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({displayRejectedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <RequestTable requests={displayRequests} />
          </TabsContent>

          <TabsContent value="pending">
            <RequestTable requests={displayPendingRequests} />
          </TabsContent>

          <TabsContent value="approved">
            <RequestTable requests={displayApprovedRequests} />
          </TabsContent>

          <TabsContent value="rejected">
            <RequestTable requests={displayRejectedRequests} />
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
                  <AvatarFallback className={`text-white text-sm font-semibold ${getAvatarColor(selectedRequest.user.name)}`}>
                    {getInitials(selectedRequest.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedRequest.user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedRequest.user.email}
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