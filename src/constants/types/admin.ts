export type AdminStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

export type AdminRole = "ADMIN" | "SUPER_ADMIN";

export interface Admin {
  id: string;
  userId: string;
  role: AdminRole;
  status: AdminStatus;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    phoneNumber?: string;
  };
  invitedBy?: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
  _count?: {
    createdLeagues: number;
    createdSeasons: number;
  };
}

export interface AdminInvite {
  email: string;
  role: AdminRole;
}

export interface AdminInviteToken {
  id: string;
  email: string;
  token: string;
  role: AdminRole;
  expiresAt: string;
  createdAt: string;
  invitedById: string;
  used: boolean;
}

export interface AdminUpdateData {
  role?: AdminRole;
  status?: AdminStatus;
}