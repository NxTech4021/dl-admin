// Helper functions and constants for the team-change feature

export const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export const HISTORY_STATUS_OPTIONS = [
  { value: "DISSOLVED", label: "Dissolved" },
  { value: "EXPIRED", label: "Expired" },
];

export const PAGE_SIZE = 15;

export const getInitials = (name: string | null | undefined): string => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return "\u2014";
  const dateObject = date instanceof Date ? date : new Date(date);
  return dateObject.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return "\u2014";
  const dateObject = date instanceof Date ? date : new Date(date);
  return dateObject.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const truncateText = (text: string | null | undefined, maxLength: number = 40): string => {
  if (!text) return "\u2014";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export const getAvatarColor = (name: string | null | undefined): string => {
  const colors = [
    "bg-slate-600",
    "bg-emerald-600",
    "bg-sky-600",
    "bg-violet-600",
    "bg-amber-600",
    "bg-rose-600",
    "bg-teal-600",
    "bg-indigo-600",
  ];
  if (!name) return colors[0];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};
