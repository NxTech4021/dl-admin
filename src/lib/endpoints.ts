import { apiClient } from "@/lib/api-client";

// Re-export apiClient as default for backward compatibility.
// New code should import { apiClient } from "@/lib/api-client" directly.
export default apiClient;

export const endpoints = {
  user: {
    trackLogin: "/api/admin/activity/tracklogin",
  },

  admin: {
    getInvite: "/api/admin/get-invite",
    getSession: "/api/admin/session",
    getAdmins: "/api/admin/getadmins",
    getProfile: (id: string) => `/api/admin/profile/${id}`,
    updateAccount: "/api/admin/account/update",
    createSuperadmin: "/api/admin/superadmin",
    updatepassword: "/api/admin/updatepassword",
    sendInvite: "/api/admin/invite",

    // Match management
    matches: {
      getAll: "/api/admin/matches",
      getStats: "/api/admin/matches/stats",
      getById: (id: string) => `/api/admin/matches/${id}`,
      voidMatch: (id: string) => `/api/admin/matches/${id}/void`,
      editResult: (id: string) => `/api/admin/matches/${id}/result`, // Fixed: was /edit-result
      editParticipants: (id: string) => `/api/admin/matches/${id}/participants`,
      validateParticipants: (id: string) => `/api/admin/matches/${id}/participants/validate`,
      convertWalkover: (id: string) => `/api/admin/matches/${id}/convert-walkover`,
      reviewCancellation: (id: string) => `/api/admin/cancellations/${id}/review`, // Fixed: correct path
      messageParticipants: (id: string) => `/api/admin/matches/${id}/message`, // Fixed: was /message-participants
      messageLogs: "/api/admin/message-logs",
      // Friendly match moderation
      hideMatch: (id: string) => `/api/admin/matches/${id}/hide`,
      unhideMatch: (id: string) => `/api/admin/matches/${id}/unhide`,
      reportAbuse: (id: string) => `/api/admin/matches/${id}/report`,
      clearReport: (id: string) => `/api/admin/matches/${id}/clear-report`,
    },

    // Penalty management
    // TODO(#050): Build penalty management page using these endpoints.
    //   Needs: penalty list table, apply penalty modal, player penalty history view.
    penalties: {
      apply: "/api/admin/penalties/apply",
      getPlayerPenalties: (userId: string) => `/api/admin/penalties/player/${userId}`,
    },

    // Division helpers
    divisions: {
      availablePlayers: (divisionId: string) => `/api/admin/divisions/${divisionId}/available-players`,
    },

    // Dispute management
    disputes: {
      getAll: "/api/admin/disputes",
      getById: (id: string) => `/api/admin/disputes/${id}`,
      startReview: (id: string) => `/api/admin/disputes/${id}/start-review`,
      resolve: (id: string) => `/api/admin/disputes/${id}/resolve`,
    },

    // Crash reports
    crashReports: {
      getAll: "/api/crash-reports/admin",
      getStats: "/api/crash-reports/admin/stats",
      getById: (id: string) => `/api/crash-reports/admin/${id}`,
      update: (id: string) => `/api/crash-reports/admin/${id}`,
    },

    // Inactivity settings
    inactivity: {
      getSettings: "/api/admin/inactivity/settings",
      getAllSettings: "/api/admin/inactivity/settings/all",
      updateSettings: "/api/admin/inactivity/settings",
      deleteSettings: (id: string) => `/api/admin/inactivity/settings/${id}`,
      triggerCheck: "/api/admin/inactivity/check",
      getStats: "/api/admin/inactivity/stats",
      toggleExempt: (userId: string) => `/api/admin/inactivity/exempt/${userId}`,
    },

    // Rating management
    // TODO(#048): Backend endpoints are ready (15 total). UI components needed:
    //   1. "Adjust Rating" button on player profile → modal with old/new rating + reason field
    //   2. "Recalculate" button on division page → confirmation dialog showing affected players
    //   3. Lock/Unlock toggle on season page → prevents rating changes after finalization
    //   4. Export button on season page → CSV/JSON download of all ratings
    //   See docs/issues/dissections/048-admin-rating-inactivity-controls.md for full spec
    ratings: {
      getDivisionRatings: (divisionId: string) => `/api/admin/ratings/division/${divisionId}`,
      getDivisionSummary: (divisionId: string) => `/api/admin/ratings/division/${divisionId}/summary`,
      adjust: "/api/admin/ratings/adjust",
      recalculateDivision: (divisionId: string) => `/api/admin/ratings/recalculate/division/${divisionId}`,
      recalculateSeason: (seasonId: string) => `/api/admin/ratings/recalculate/${seasonId}`,
      lockSeason: (seasonId: string) => `/api/admin/ratings/lock/${seasonId}`,
      unlockSeason: (seasonId: string) => `/api/admin/ratings/unlock/${seasonId}`,
      getLockStatus: (seasonId: string) => `/api/admin/ratings/lock-status/${seasonId}`,
      exportSeason: (seasonId: string) => `/api/admin/ratings/export/${seasonId}`,
    },

    // Dashboard statistics
    dashboard: {
      getAll: "/api/admin/dashboard/stats",
      getKPI: "/api/admin/dashboard/kpi",
      getSports: "/api/admin/dashboard/sports",
      getMatchActivity: "/api/admin/dashboard/match-activity",
      getUserGrowth: "/api/admin/dashboard/user-growth",
      getSportComparison: "/api/admin/dashboard/sport-comparison",
    },

    // Player management (ban, unban, delete, status, edit)
    players: {
      getAll: "/api/admin/players",
      getById: (id: string) => `/api/admin/players/${id}`,
      update: (id: string) => `/api/admin/players/${id}`,
      ban: (id: string) => `/api/admin/players/${id}/ban`,
      unban: (id: string) => `/api/admin/players/${id}/unban`,
      delete: (id: string) => `/api/admin/players/${id}`,
      updateStatus: (id: string) => `/api/admin/players/${id}/status`,
      getStatusHistory: (id: string) => `/api/admin/players/${id}/status-history`,
    },

    // Admin status management (suspend, activate, status history, detail)
    admins: {
      getDetail: (id: string) => `/api/admin/admins/${id}`,
      suspend: (id: string) => `/api/admin/admins/${id}/suspend`,
      activate: (id: string) => `/api/admin/admins/${id}/activate`,
      getStatusHistory: (id: string) => `/api/admin/admins/${id}/status-history`,
    },

    // Admin action logs
    logs: {
      getAll: "/api/admin/logs",
      getSummary: "/api/admin/logs/summary",
      getActionTypes: "/api/admin/logs/action-types",
      getTargetTypes: "/api/admin/logs/target-types",
      getForTarget: (targetType: string, targetId: string) => `/api/admin/logs/target/${targetType}/${targetId}`,
    },

    // User activity logs (player actions)
    userActivity: {
      getAll: "/api/admin/user-activity",
      getForUser: (userId: string) => `/api/admin/user-activity/user/${userId}`,
      getForTarget: (targetType: string, targetId: string) =>
        `/api/admin/user-activity/target/${targetType}/${targetId}`,
    },

    // Admin reports
    reports: {
      playerRegistration: "/api/admin/reports/player-registration",
      playerRetention: "/api/admin/reports/player-retention",
      seasonPerformance: "/api/admin/reports/season-performance",
      disputeAnalysis: "/api/admin/reports/dispute-analysis",
      revenue: "/api/admin/reports/revenue",
      membership: "/api/admin/reports/membership",
    },

    // System controls
    systemControls: {
      maintenance: {
        create: "/api/admin/system/maintenance",
        update: (id: string) => `/api/admin/system/maintenance/${id}`,
        getUpcoming: "/api/admin/system/maintenance/upcoming",
        notify: (id: string) => `/api/admin/system/maintenance/${id}/notify`,
        start: (id: string) => `/api/admin/system/maintenance/${id}/start`,
        complete: (id: string) => `/api/admin/system/maintenance/${id}/complete`,
        cancel: (id: string) => `/api/admin/system/maintenance/${id}/cancel`,
      },
      announcements: {
        create: "/api/admin/system/announcements",
        update: (id: string) => `/api/admin/system/announcements/${id}`,
        publish: (id: string) => `/api/admin/system/announcements/${id}/publish`,
        archive: (id: string) => `/api/admin/system/announcements/${id}/archive`,
        getPublished: "/api/admin/system/announcements/published",
        appUpdate: "/api/admin/system/announcements/app-update",
      },
      termsOfService: {
        get: "/api/admin/system/tos",
        update: "/api/admin/system/tos",
      },
    },
  },

  player: {
    getAll: "/api/player/",
    getStats: "/api/player/stats",
    getById: (id: string) => `/api/player/${id}`,

    // Player history endpoints
    getLeagueHistory: (id: string) => `/api/player/${id}/leagues`,
    getSeasonHistory: (id: string) => `/api/player/${id}/seasons`,
    getDivisionHistory: (id: string) => `/api/player/${id}/divisions`,
    getMatchHistoryAdmin: (id: string) => `/api/player/${id}/matches`,

    // authenticated player profile
    getProfile: "/api/player/profile/me",
    updateProfile: "/api/player/profile/me",
    changePassword: "/api/player/profile/password",
    getMatchHistory: "/api/player/profile/matches",
    getAchievements: "/api/player/profile/achievements",
    getMatchDetails: (matchId: string) => `/api/player/matches/${matchId}`,
  },

  league: {
    getAll: "/api/league/",
    getById: (id: string) => `/api/league/${id}`,
    create: "/api/league/create",
    update: (id: string) => `/api/league/${id}`,
    delete: (id: string) => `/api/league/${id}`,
  },

  season: {
    create: "/api/season/",
    getAll: "/api/season/",
    getById: (id: string) => `/api/season/${id}`,
    update: (id: string) => `/api/season/${id}`,
    updateStatus: (id: string) => `/api/season/${id}/status`,
    delete: (id: string) => `/api/season/${id}`,
  },

  sponsors: {
    create: "/api/sponsor/create",
    getAll: "/api/sponsor/",
    getById: (id: string) => `/api/sponsor/${id}`,
    update: (id: string) => `/api/sponsor/${id}`,
    delete: (id: string) => `/api/sponsor/${id}`,
  },

  categories: {
    create: "/api/category/create",
    getAll: "/api/category/",
    getById: (id: string) => `/api/category/${id}`,
    update: (id: string) => `/api/category/${id}`,
    delete: (id: string) => `/api/category/${id}`,
    getByLeague: (leagueId: string) => `/api/category/league/${leagueId}`,
  },

  division: {
    create: "/api/division/create",
    getAll: "/api/division/",
    getById: (id: string) => `/api/division/${id}`,
    update: (id: string) => `/api/division/${id}`,
    delete: (id: string) => `/api/division/delete/${id}`,
    getBySeasonId: (seasonId: string) => `/api/division/season/${seasonId}`,
   
    //Player Assign to Division 
    assignPlayer: "/api/division/assign",
    removePlayer: (divisionId: string, userId: string) => `/api/division/${divisionId}/users/${userId}`,
    getDivisionAssignments: (divisionId: string) => `/api/division/divisions/${divisionId}`,
    getUserDivisionAssignments: (userId: string) => `/api/division/users/${userId}`,
    autoAssign: "/api/division/auto-assign",
    transferPlayer: "/api/division/transfer",
  },

  match: {
    create: "/api/match/create",
    getAll: "/api/match",
    getById: (id: string) => `/api/match/${id}`,
    update: (id: string) => `/api/match/${id}`,
    delete: (id: string) => `/api/match/delete/${id}`,
    getDivisionResults: (divisionId: string) => `/api/match/division/${divisionId}/results`,
  },

  chat: {
    createThread: "/api/chat/threads/",
    getThreads: (userId: string) => `/api/chat/threads/${userId}`,
    getThreadMembers: (threadId: string) => `/api/chat/threads/${threadId}/members`,
    sendMessage: (threadId: string) => `/api/chat/threads/${threadId}/messages`,
    getMessages: (threadId: string) => `/api/chat/threads/${threadId}/messages`,
    markAsRead: (messageId: string) => `/api/chat/messages/${messageId}/read`,
    markThreadAsRead: (threadId: string) => `/api/chat/${threadId}/mark-read`,
    getAvailableUsers: (userId: string) => `/api/chat/threads/users/available/${userId}`,
    deleteMessage: (messageId: string) => `/api/chat/threads/messages/${messageId}`,
    // Add contacts endpoints
    getContacts: (userId: string) => `/api/users/${userId}/contacts`,
    getAllUsers: "/api/users",
  },

   notifications: {
    getAll: "/api/notifications/",
    unreadCount: "/api/notifications/unread-count",
    markRead: (id: string) => `/api/notifications/${id}/read`,
    markAllRead: "/api/notifications/mark-all-read",
    delete: (id: string) => `/api/notifications/${id}`,
    deleteMany: "/api/notifications/delete-many",
    clearAll: "/api/notifications/clear-all",
  },

  pairing: {
    getRequests: "/api/pairing/requests",
    acceptRequest: (requestId: string) => `/api/pairing/request/${requestId}/accept`,
    denyRequest: (requestId: string) => `/api/pairing/request/${requestId}/deny`,
    cancelRequest: (requestId: string) => `/api/pairing/request/${requestId}`,
  },

  teamChangeRequests: {
    getAll: "/api/team-change-requests",
    getById: (id: string) => `/api/team-change-requests/${id}`,
    getPendingCount: "/api/team-change-requests/count/pending",
    process: (id: string) => `/api/team-change-requests/${id}/process`,
    cancel: (id: string) => `/api/team-change-requests/${id}/cancel`,
  },

  bug: {
    init: "/api/bug/init/dla",
    apps: "/api/bug/apps",
    getSettings: (appId: string) => `/api/bug/admin/apps/${appId}/settings`,
    updateSettings: (appId: string) => `/api/bug/admin/apps/${appId}/settings`,
  },

  payments: {
    getAll: "/api/admin/payments",
    getStats: "/api/admin/payments/stats",
    updateStatus: (membershipId: string) => `/api/admin/payments/${membershipId}/status`,
    bulkUpdateStatus: "/api/admin/payments/bulk-status",
  },

  withdrawal: {
    process: (id: string) => `/api/season/withdrawals/${id}/process`,
  },

  partnershipAdmin: {
    getWithdrawalRequests: "/api/admin/partnerships/withdrawal-requests",
    getWithdrawalRequestStats: "/api/admin/partnerships/withdrawal-requests/stats",
    getDissolvedPartnerships: "/api/admin/partnerships/dissolved",
    getDissolvedPartnershipById: (id: string) => `/api/admin/partnerships/dissolved/${id}`,
  },

  achievements: {
    getAll: "/api/admin/achievements",
    getById: (id: string) => `/api/admin/achievements/${id}`,
    getEvaluators: "/api/admin/achievements/evaluators",
    create: "/api/admin/achievements",
    update: (id: string) => `/api/admin/achievements/${id}`,
    delete: (id: string) => `/api/admin/achievements/${id}`,
    grant: (id: string) => `/api/admin/achievements/${id}/grant`,
    finalizeSeason: (seasonId: string) => `/api/admin/achievements/finalize-season/${seasonId}`,
  },
};