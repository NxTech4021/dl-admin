import * as React from "react";
import axiosInstance, { endpoints } from "@/lib/endpoints";

interface PairingRequest {
  id: string;
  sender?: { id: string; name: string; email: string };
  receiver?: { id: string; name: string; email: string };
  message?: string;
  status: string;
  createdAt: string;
}

interface PairingRequests {
  received: PairingRequest[];
  sent: PairingRequest[];
}

interface PairingLoading {
  received: boolean;
  sent: boolean;
}

export function usePlayerPairingRequests(playerId: string) {
  const [pairingRequests, setPairingRequests] = React.useState<PairingRequests>({
    received: [],
    sent: [],
  });
  const [pairingLoading, setPairingLoading] = React.useState<PairingLoading>({
    received: false,
    sent: false,
  });

  const fetchPairingRequests = React.useCallback(async () => {
    if (pairingRequests.received.length > 0 && pairingRequests.sent.length > 0) {
      return; // Already loaded
    }

    setPairingLoading({ received: true, sent: true });
    try {
      // Fetch pairing requests
      const response = await axiosInstance.get(endpoints.pairing.getRequests);

      if (response.status === 200) {
        setPairingRequests({
          received: response.data.data?.received || [],
          sent: response.data.data?.sent || [],
        });
      }
    } catch (error) {
      console.error("Failed to load pairing requests:", error);
      setPairingRequests({ received: [], sent: [] });
    } finally {
      setPairingLoading({ received: false, sent: false });
    }
  }, [playerId, pairingRequests.received.length, pairingRequests.sent.length]);

  const handleAcceptRequest = React.useCallback(
    async (requestId: string) => {
      try {
        await axiosInstance.post(endpoints.pairing.acceptRequest(requestId));
        // Refetch requests
        setPairingRequests({ received: [], sent: [] });
        await fetchPairingRequests();
      } catch (error) {
        console.error("Failed to accept request:", error);
      }
    },
    [fetchPairingRequests]
  );

  const handleDenyRequest = React.useCallback(
    async (requestId: string) => {
      try {
        await axiosInstance.post(endpoints.pairing.denyRequest(requestId));
        // Refetch requests
        setPairingRequests({ received: [], sent: [] });
        await fetchPairingRequests();
      } catch (error) {
        console.error("Failed to deny request:", error);
      }
    },
    [fetchPairingRequests]
  );

  const handleCancelRequest = React.useCallback(
    async (requestId: string) => {
      try {
        await axiosInstance.delete(endpoints.pairing.cancelRequest(requestId));
        // Refetch requests
        setPairingRequests({ received: [], sent: [] });
        await fetchPairingRequests();
      } catch (error) {
        console.error("Failed to cancel request:", error);
      }
    },
    [fetchPairingRequests]
  );

  return {
    pairingRequests,
    pairingLoading,
    fetchPairingRequests,
    handleAcceptRequest,
    handleDenyRequest,
    handleCancelRequest,
  };
}
