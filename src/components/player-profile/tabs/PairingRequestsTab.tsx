import React from "react";
import {
  IconUserCircle,
  IconMessage,
  IconCalendar,
  IconCheck,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PairingRequest {
  id: string;
  status?: string;
  message?: string;
  createdAt?: string;
  sender?: {
    name?: string;
    email?: string;
  };
  receiver?: {
    name?: string;
    email?: string;
  };
}

interface PairingRequests {
  received: PairingRequest[];
  sent: PairingRequest[];
}

interface PairingLoading {
  received: boolean;
  sent: boolean;
}

interface PairingRequestsTabProps {
  pairingRequests: PairingRequests;
  pairingLoading: PairingLoading;
  handleAcceptRequest: (requestId: string) => Promise<void>;
  handleDenyRequest: (requestId: string) => Promise<void>;
  handleCancelRequest: (requestId: string) => Promise<void>;
}

export function PairingRequestsTab({ 
  pairingRequests,
  pairingLoading,
  handleAcceptRequest,
  handleDenyRequest,
  handleCancelRequest
}: PairingRequestsTabProps) {
  // Filter approved pairs from both received and sent
  const approvedPairs = [
    ...pairingRequests.received.filter((req) => req.status === 'ACCEPTED'),
    ...pairingRequests.sent.filter((req) => req.status === 'ACCEPTED'),
  ];

  return (
    <TabsContent value="pairing_requests">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconMessage className="size-5" />
            Player Pairing Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="received" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="received">Received ({pairingRequests.received.length})</TabsTrigger>
              <TabsTrigger value="sent">Sent ({pairingRequests.sent.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approvedPairs.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="received">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">
                        <div className="flex items-center gap-2">
                          <IconUserCircle className="size-4" />
                          Player
                        </div>
                      </TableHead>
                      <TableHead className="w-[180px]">
                        <div className="flex items-center gap-2">
                          <IconMessage className="size-4" />
                          Message
                        </div>
                      </TableHead>
                      <TableHead className="w-[120px]">
                        <div className="flex items-center gap-2">
                          <IconCalendar className="size-4" />
                          Date
                        </div>
                      </TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[120px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pairingLoading.received ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center">
                          <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="text-sm">Loading pairing requests...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : pairingRequests.received.length > 0 ? (
                      pairingRequests.received.map((request) => (
                        <TableRow key={request.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{request.sender?.name || 'Unknown'}</div>
                              <div className="text-xs text-muted-foreground">
                                @{request.sender?.email?.split('@')[0] || 'unknown'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {request.message || 'No message'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {request.createdAt ? new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={request.status === 'PENDING' ? 'secondary' : request.status === 'ACCEPTED' ? 'default' : 'destructive'} className="capitalize text-xs">
                              {request.status?.toLowerCase() || 'pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {request.status === 'PENDING' && (
                              <div className="flex gap-2 justify-end">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 px-3 text-xs"
                                  onClick={() => handleAcceptRequest(request.id)}
                                >
                                  Accept
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 px-3 text-xs"
                                  onClick={() => handleDenyRequest(request.id)}
                                >
                                  Decline
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center">
                          <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <IconMessage className="size-12 opacity-50" />
                            <div className="space-y-1">
                              <p className="text-sm font-medium">No pairing requests received</p>
                              <p className="text-xs">Received pairing requests will appear here</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="sent">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">
                        <div className="flex items-center gap-2">
                          <IconUserCircle className="size-4" />
                          Player
                        </div>
                      </TableHead>
                      <TableHead className="w-[180px]">
                        <div className="flex items-center gap-2">
                          <IconMessage className="size-4" />
                          Message
                        </div>
                      </TableHead>
                      <TableHead className="w-[120px]">
                        <div className="flex items-center gap-2">
                          <IconCalendar className="size-4" />
                          Date
                        </div>
                      </TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[120px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pairingLoading.sent ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center">
                          <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="text-sm">Loading pairing requests...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : pairingRequests.sent.length > 0 ? (
                      pairingRequests.sent.map((request) => (
                        <TableRow key={request.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{request.receiver?.name || 'Unknown'}</div>
                              <div className="text-xs text-muted-foreground">
                                @{request.receiver?.email?.split('@')[0] || 'unknown'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {request.message || 'No message'}
                            </div>
                          </TableCell>  
                          <TableCell>
                            <div className="text-sm">
                              {request.createdAt ? new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={request.status === 'PENDING' ? 'secondary' : request.status === 'ACCEPTED' ? 'default' : 'destructive'} className="capitalize text-xs">
                              {request.status?.toLowerCase() || 'pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {request.status === 'PENDING' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-3 text-xs"
                                onClick={() => handleCancelRequest(request.id)}
                              >
                                Cancel
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center">
                          <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <IconMessage className="size-12 opacity-50" />
                            <div className="space-y-1">
                              <p className="text-sm font-medium">No pairing requests sent</p>
                              <p className="text-xs">Sent pairing requests will appear here</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="approved">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">
                        <div className="flex items-center gap-2">
                          <IconUserCircle className="size-4" />
                          Partner
                        </div>
                      </TableHead>
                      <TableHead className="w-[180px]">
                        <div className="flex items-center gap-2">
                          <IconMessage className="size-4" />
                          Message
                        </div>
                      </TableHead>
                      <TableHead className="w-[120px]">
                        <div className="flex items-center gap-2">
                          <IconCalendar className="size-4" />
                          Date
                        </div>
                      </TableHead>
                      <TableHead className="w-[100px]">
                        <div className="flex items-center gap-2">
                          <IconCheck className="size-4" />
                          Status
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pairingLoading.received || pairingLoading.sent ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center">
                          <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="text-sm">Loading approved pairs...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : approvedPairs.length > 0 ? (
                      approvedPairs.map((pair) => (
                        <TableRow key={pair.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-sm">
                                {pair.sender?.name === pair.sender?.name ? pair.receiver?.name : pair.sender?.name || 'Unknown'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                @{(pair.sender?.name === pair.sender?.name ? pair.receiver?.email : pair.sender?.email)?.split('@')[0] || 'unknown'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {pair.message || 'No message'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {pair.createdAt ? new Date(pair.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default" className="capitalize text-xs">
                              <IconCheck className="size-3 mr-1" />
                              Approved
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center">
                          <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <IconCheck className="size-12 opacity-50" />
                            <div className="space-y-1">
                              <p className="text-sm font-medium">No approved pairs yet</p>
                              <p className="text-xs">Approved pairing requests will appear here</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
