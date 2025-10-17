import * as React from "react";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { PlayerProfileData } from "../types";

export function usePlayerProfile(playerId: string) {
  const [profile, setProfile] = React.useState<PlayerProfileData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!playerId) return;

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(endpoints.player.getById(playerId));
        if (response.status !== 200) {
          throw new Error("Failed to fetch profile");
        }
        const result = response.data;
        setProfile(result.data);
      } catch (err) {
        console.error("Error fetching player profile:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [playerId]);

  return { profile, isLoading, error };
}

