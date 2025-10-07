// app/seasons/[id]/components/WithdrawalRequestsCard.tsx
// import { WithdrawalRequest } from '@prisma/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WithdrawalRequest } from '@/MockData/types';

interface WithdrawalRequestsCardProps {
  requests: WithdrawalRequest[];
}

export default function WithdrawalRequestsCard({ requests }: WithdrawalRequestsCardProps) {
  const pendingRequests = requests.filter(r => r.status === 'PENDING'); // Assume status exists

  return (
    <Card>
      <CardHeader>
        {/* <CardTitle>Withdrawal Requests ({pendingRequests.length} Pending)</CardTitle> */}
          <CardTitle>Withdrawal Requests 0 Pending</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingRequests.length > 0 ? (
          pendingRequests.map((request) => (
            <div key={request.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">Request from User ID: {request.userId}</p>
                <p className="text-sm text-muted-foreground">
                  Amount: ${request.amount.toFixed(2)} - Status: <Badge variant="secondary">{request.status}</Badge>
                </p>
              </div>
              <Button variant="outline" size="sm">Review</Button>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No pending withdrawal requests.</p>
        )}
        <Separator />
        <Button variant="link" className="w-full">View All Requests</Button>
      </CardContent>
    </Card>
  );
}