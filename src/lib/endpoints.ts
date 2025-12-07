import axios, { AxiosError } from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_HOST_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (res) => res,
  // (error) =>
  //   Promise.reject(
  //     (error.response && error.response.data) || "Something went wrong"
  //   )
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;

export const fetcher = async (args: unknown) => {
  const [url, config] = Array.isArray(args) ? args : [args];
  const res = await axiosInstance.get(url, { ...config });
  return res.data;
};

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
      editResult: (id: string) => `/api/admin/matches/${id}/edit-result`,
      editParticipants: (id: string) => `/api/admin/matches/${id}/participants`,
      validateParticipants: (id: string) => `/api/admin/matches/${id}/participants/validate`,
      convertWalkover: (id: string) => `/api/admin/matches/${id}/convert-walkover`,
      reviewCancellation: (id: string) => `/api/admin/matches/${id}/review-cancellation`,
      messageParticipants: (id: string) => `/api/admin/matches/${id}/message-participants`,
      // Friendly match moderation
      hideMatch: (id: string) => `/api/admin/matches/${id}/hide`,
      unhideMatch: (id: string) => `/api/admin/matches/${id}/unhide`,
      reportAbuse: (id: string) => `/api/admin/matches/${id}/report`,
      clearReport: (id: string) => `/api/admin/matches/${id}/clear-report`,
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

    // Inactivity settings
    inactivity: {
      getSettings: "/api/admin/inactivity/settings",
      getAllSettings: "/api/admin/inactivity/settings/all",
      updateSettings: "/api/admin/inactivity/settings",
      deleteSettings: (id: string) => `/api/admin/inactivity/settings/${id}`,
      triggerCheck: "/api/admin/inactivity/check",
      getStats: "/api/admin/inactivity/stats",
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
  },

  chat: {
    createThread: "/api/chat/threads/",
    getThreads: (userId: string) => `/api/chat/threads/${userId}`,
    getThreadMembers: (threadId: string) => `/api/chat/threads/${threadId}/members`,
    sendMessage: (threadId: string) => `/api/chat/threads/${threadId}/messages`,
    getMessages: (threadId: string) => `/api/chat/threads/${threadId}/messages`,
    markAsRead: (messageId: string) => `/api/chat/messages/${messageId}/read`,
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
};