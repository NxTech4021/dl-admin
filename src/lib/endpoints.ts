import axios, { AxiosError } from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_HOST_URL,
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
  admin: {
    getInvite: "/api/admin/get-invite",
    getSession: "/api/admin/session",
    getAdmins: "/api/admin/getadmins",
    getProfile: (id: string) => `/api/admin/profile/${id}`,
    updateAccount: "/api/admin/account/update",
    createSuperadmin: "/api/admin/superadmin",
    updatepassword: "/api/admin/updatepassword",
    sendInvite: "/api/admin/invite",
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
    
    //Player Assign to Division 
    assignPlayer: "/api/division/assign",
    removePlayer: (divisionId: string, userId: string) =>
    `/api/division/${divisionId}/users/${userId}`,
    getDivisionAssignments: (divisionId: string) =>
    `/api/division/divisions/${divisionId}`,
    getUserDivisionAssignments: (userId: string) =>
    `/api/division/users/${userId}`,
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
};
