import type { AdminStatus } from "./types";

export const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

export const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });

export const formatShortDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export function getAdminStatusConfig(status: AdminStatus) {
  const config: Record<
    AdminStatus,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      className?: string;
      label: string;
    }
  > = {
    ACTIVE: {
      variant: "default",
      className: "bg-emerald-600",
      label: "Active",
    },
    SUSPENDED: { variant: "destructive", label: "Suspended" },
    PENDING: { variant: "secondary", label: "Pending" },
  };
  return config[status] || { variant: "secondary" as const, label: status };
}

export function getRoleBadgeConfig(role: string) {
  if (role === "SUPERADMIN") {
    return {
      variant: "default" as const,
      className: "bg-amber-600",
      label: "Super Admin",
    };
  }
  return {
    variant: "outline" as const,
    className: "text-blue-600 border-blue-600",
    label: "Admin",
  };
}
