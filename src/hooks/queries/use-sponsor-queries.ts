import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/lib/endpoints";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";

/** Sponsor option for dropdown selection */
export interface SponsorOption {
  id: string;
  name: string;
}

/** Raw sponsorship from API */
interface SponsorshipResponse {
  id: string;
  sponsoredName?: string;
  company?: {
    id: string;
    name: string;
  };
}

export function useSponsors(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.sponsors.list(),
    queryFn: async (): Promise<SponsorOption[]> => {
      const response = await apiClient.get(endpoints.sponsors.getAll);
      const api = response.data;
      const sponsorships = (api?.data?.sponsorships || api?.data || api || []) as SponsorshipResponse[];
      return sponsorships.map((s) => ({
        id: s.id,
        name: s.company?.name || s.sponsoredName || "Unnamed Sponsor",
      }));
    },
    enabled,
  });
}
