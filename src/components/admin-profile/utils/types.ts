import type {
  AdminDetail,
  AdminStatus,
  AdminStatusHistoryItem,
} from "@/constants/zod/admin-schema";

export type { AdminDetail, AdminStatus, AdminStatusHistoryItem };

export interface AdminProfileProps {
  adminId: string;
}
