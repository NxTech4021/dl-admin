import { Badge } from "@/components/ui/badge";
import {
  IconCircleCheck,
  IconClock,
  IconAlertTriangle,
  IconBan,
  IconReceiptRefund,
} from "@tabler/icons-react";

export const getPaymentStatusBadge = (status: string | undefined) => {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
        >
          <IconCircleCheck className="size-3 mr-1" />
          Paid
        </Badge>
      );
    case "PENDING":
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800"
        >
          <IconClock className="size-3 mr-1" />
          Pending
        </Badge>
      );
    case "FAILED":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800"
        >
          <IconAlertTriangle className="size-3 mr-1" />
          Failed
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/50 dark:text-gray-400 dark:border-gray-800"
        >
          <IconBan className="size-3 mr-1" />
          Cancelled
        </Badge>
      );
    case "REFUNDED":
      return (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-800"
        >
          <IconReceiptRefund className="size-3 mr-1" />
          Refunded
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Unknown
        </Badge>
      );
  }
};

export const getMembershipStatusBadge = (status: string | undefined, size: "sm" | "default" = "default") => {
  const sizeClass = size === "sm" ? "text-xs" : "";
  switch (status) {
    case "ACTIVE":
      return (
        <Badge variant="default" className={`capitalize ${sizeClass}`}>
          Active
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="secondary" className={`capitalize ${sizeClass}`}>
          Pending
        </Badge>
      );
    case "INACTIVE":
      return (
        <Badge variant="outline" className={`capitalize text-muted-foreground ${sizeClass}`}>
          Inactive
        </Badge>
      );
    case "FLAGGED":
      return (
        <Badge variant="destructive" className={`capitalize ${sizeClass}`}>
          Flagged
        </Badge>
      );
    case "REMOVED":
      return (
        <Badge variant="outline" className={`capitalize text-red-600 border-red-200 ${sizeClass}`}>
          Removed
        </Badge>
      );
    case "WAITLISTED":
      return (
        <Badge variant="outline" className={`capitalize text-amber-600 border-amber-200 ${sizeClass}`}>
          Waitlisted
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={`capitalize ${sizeClass}`}>
          {status?.toLowerCase() || "Unknown"}
        </Badge>
      );
  }
};

export const getInitials = (name: string | null | undefined): string => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const getAvatarColor = (name: string): string => {
  const colors = [
    "bg-slate-600",
    "bg-zinc-600",
    "bg-stone-600",
    "bg-emerald-600",
    "bg-teal-600",
    "bg-cyan-600",
    "bg-sky-600",
    "bg-indigo-600",
    "bg-violet-600",
    "bg-fuchsia-600",
  ];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length]!;
};
