'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WithdrawalRequest } from '@/ZodSchema/season-schema';

interface WithdrawalRequestsCardProps {
  requests: WithdrawalRequest[];
}

export default function WithdrawalRequestsCard({ requests }: WithdrawalRequestsCardProps) {
  const pendingRequests = requests.filter(r => r.status === 'PENDING');

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Withdrawal Requests ({pendingRequests.length} Pending)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingRequests.length > 0 ? (
          pendingRequests.map((request) => (
            <div key={request.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{request.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  Amount: {new Intl.NumberFormat('en-MY', {
                    style: 'currency',
                    currency: 'MYR'
                  }).format(request.amount)}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Implement review logic
                  console.log('Review request:', request.id);
                }}
              >
                Review
              </Button>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground">
            No pending withdrawal requests
          </p>
        )}
        <Separator />
        <Button variant="link" className="w-full">
          View All Requests
        </Button>
      </CardContent>
    </Card>
  );
}