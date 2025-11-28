/**
 * UI Constants for consistent sizing across the application
 */

export const ICON_SIZES = {
  nav: "size-4", // 16px - navigation items
  header: "size-5", // 20px - page headers
  avatar: "size-8", // 32px - user avatars
  feature: "size-6", // 24px - feature highlights
  badge: "size-3", // 12px - small decorative icons
} as const;

export const SPACING = {
  sectionGap: "gap-4", // 16px between major sections
  itemGap: "gap-1", // 4px between menu items
  groupPadding: "p-3", // 12px section padding
  itemPadding: "px-3 py-2", // 12px horizontal, 8px vertical
} as const;

export const TYPOGRAPHY = {
  sectionLabel: "text-xs font-semibold uppercase tracking-wider",
  menuItem: "text-sm font-medium",
  menuItemActive: "text-sm font-semibold",
} as const;
