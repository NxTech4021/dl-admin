import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";

export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return {
    invalidatePlayers: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.players.all }),
    invalidateLeagues: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.all }),
    invalidateSeasons: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.seasons.all }),
    invalidateDivisions: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.divisions.all }),
    invalidateAdmins: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.admins.all }),
    invalidateMatches: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all }),
    invalidateDisputes: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.disputes.all }),
    invalidateSponsors: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.sponsors.all }),
    invalidateBugSettings: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.bug.all }),
    invalidatePayments: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all }),
    invalidateAll: () => queryClient.invalidateQueries(),
  };
}
