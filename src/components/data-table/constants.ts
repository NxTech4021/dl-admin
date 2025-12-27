// Table Configuration
export const TABLE_CONFIG = {
  PAGE_SIZES: [10, 20, 30, 40, 50] as const,
  DEFAULT_PAGE_SIZE: 10,
  SEARCH_DEBOUNCE: 300,
} as const;

// Column Widths
export const COLUMN_WIDTHS = {
  CHECKBOX: 'w-12',
  AVATAR: 'w-16',
  ACTIONS: 'w-20',
  SMALL: 'w-24',
  MEDIUM: 'w-32',
  LARGE: 'w-48',
  EXTRA_LARGE: 'w-64',
} as const;

// Badge Variants for Status
export const STATUS_BADGE_VARIANTS = {
  SEASON: {
    UPCOMING: 'secondary',
    ACTIVE: 'default',
    FINISHED: 'outline',
    CANCELLED: 'destructive',
  },
  
  LEAGUE: {
    ACTIVE: 'default',
    ONGOING: 'default',
    UPCOMING: 'secondary',
    FINISHED: 'outline',
    INACTIVE: 'outline',
    CANCELLED: 'destructive',
    SUSPENDED: 'destructive',
  },
  
  ADMIN: {
    PENDING: 'secondary',
    ACTIVE: 'default',
    SUSPENDED: 'destructive',
  },

  DIVISION: {
    ACTIVE: 'default',
    INACTIVE: 'outline',
  },

  WITHDRAWAL: {
    PENDING: 'secondary',
    APPROVED: 'default',
    REJECTED: 'destructive',
  },

  MATCH: {
    DRAFT: 'secondary',
    SCHEDULED: 'default',
    ONGOING: 'default',
    COMPLETED: 'outline',
    UNFINISHED: 'secondary',
    CANCELLED: 'destructive',
    VOID: 'destructive',
  },

  INVITATION: {
    PENDING: 'secondary',
    ACCEPTED: 'default',
    DECLINED: 'destructive',
    EXPIRED: 'outline',
    CANCELLED: 'destructive',
  },

  DISPUTE: {
    OPEN: 'destructive',
    UNDER_REVIEW: 'secondary',
    RESOLVED: 'default',
    REJECTED: 'outline',
  },
} as const;

// Centralized Color Palette for All Badges
export const STATUS_BADGE_COLORS = {
  SEASON: {
    UPCOMING: 'bg-blue-500 hover:bg-blue-600 text-white border-transparent',
    ACTIVE: 'bg-green-500 hover:bg-green-600 text-white border-transparent',
    FINISHED: 'bg-gray-400 hover:bg-gray-500 text-white border-gray-400',
    CANCELLED: 'bg-red-500 hover:bg-red-600 text-white border-transparent',
  },
  
  LEAGUE: {
    ACTIVE: 'bg-green-500 hover:bg-green-600 text-white border-transparent',
    ONGOING: 'bg-green-500 hover:bg-green-600 text-white border-transparent',
    UPCOMING: 'bg-blue-500 hover:bg-blue-600 text-white border-transparent',
    FINISHED: 'bg-gray-400 hover:bg-gray-500 text-white border-gray-400',
    INACTIVE: 'bg-gray-300 hover:bg-gray-400 text-gray-700 border-gray-300',
    CANCELLED: 'bg-red-500 hover:bg-red-600 text-white border-transparent',
    SUSPENDED: 'bg-orange-500 hover:bg-orange-600 text-white border-transparent',
  },
  
  ADMIN: {
    PENDING: 'bg-yellow-300 hover:bg-yellow-400 text-gray-900 border-yellow-300',
    ACTIVE: 'bg-green-500 hover:bg-green-600 text-white border-transparent',
    SUSPENDED: 'bg-red-400 hover:bg-red-500 text-white border-transparent',
  },

  DIVISION: {
    ACTIVE: 'bg-green-500 hover:bg-green-600 text-white border-transparent',
    INACTIVE: 'bg-gray-300 hover:bg-gray-400 text-gray-700 border-gray-300',
  },

  WITHDRAWAL: {
    PENDING: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-200',
    APPROVED: 'bg-green-100 hover:bg-green-200 text-green-800 border-green-200',
    REJECTED: 'bg-red-100 hover:bg-red-200 text-red-800 border-red-200',
  },

  MATCH: {
    DRAFT: 'bg-gray-400 hover:bg-gray-500 text-white border-gray-400',
    SCHEDULED: 'bg-blue-500 hover:bg-blue-600 text-white border-transparent',
    ONGOING: 'bg-green-500 hover:bg-green-600 text-white border-transparent',
    COMPLETED: 'bg-gray-300 hover:bg-gray-400 text-gray-700 border-gray-300',
    UNFINISHED: 'bg-yellow-400 hover:bg-yellow-500 text-gray-900 border-yellow-400',
    CANCELLED: 'bg-red-500 hover:bg-red-600 text-white border-transparent',
    VOID: 'bg-red-700 hover:bg-red-800 text-white border-transparent',
  },

  INVITATION: {
    PENDING: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-200',
    ACCEPTED: 'bg-green-100 hover:bg-green-200 text-green-800 border-green-200',
    DECLINED: 'bg-red-100 hover:bg-red-200 text-red-800 border-red-200',
    EXPIRED: 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200',
    CANCELLED: 'bg-red-200 hover:bg-red-300 text-red-900 border-red-300',
  },

  DISPUTE: {
    OPEN: 'bg-red-500 hover:bg-red-600 text-white border-transparent',
    UNDER_REVIEW: 'bg-orange-500 hover:bg-orange-600 text-white border-transparent',
    RESOLVED: 'bg-green-500 hover:bg-green-600 text-white border-transparent',
    REJECTED: 'bg-gray-400 hover:bg-gray-500 text-white border-gray-400',
  },
} as const;

// Legacy support - keep for backward compatibility but mark as deprecated
/** @deprecated Use STATUS_BADGE_COLORS instead */
export const CUSTOM_BADGE_COLORS = {
  ADMIN_STATUS: STATUS_BADGE_COLORS.ADMIN,
  WITHDRAWAL_STATUS: STATUS_BADGE_COLORS.WITHDRAWAL,
} as const;

// Game Type Labels
export const GAME_TYPE_LABELS = {
  SINGLES: 'Singles',
  DOUBLES: 'Doubles',
  MIXED: 'Mixed Doubles',
  singles: 'Singles',
  doubles: 'Doubles',
  mixed: 'Mixed Doubles',
} as const;

// Division Level Labels
export const DIVISION_LEVEL_LABELS = {
  beginner: 'Beginner',
  improver: 'Improver',
  intermediate: 'Intermediate',
  upper_intermediate: 'Upper Intermediate',
  expert: 'Expert',
  advanced: 'Advanced',
} as const;

// Gender Category Labels
export const GENDER_CATEGORY_LABELS = {
  male: 'Male',
  female: 'Female',
  mixed: 'Mixed',
} as const;

// Date Formats
export const DATE_FORMATS = {
  TABLE_DISPLAY: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  } as const,
  LOCALE: 'en-MY',
} as const;

// Currency Formats
export const CURRENCY_FORMATS = {
  MYR: {
    style: 'currency',
    currency: 'MYR',
  } as const,
  USD: {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  } as const,
} as const;

// Table Loading States
export const LOADING_STATES = {
  LOADING_TEXT: 'Loading...',
  NO_DATA_TEXT: 'No data found.',
  SEARCH_PLACEHOLDER: {
    SEASONS: 'Search seasons by name, league type, entry fee...',
    LEAGUES: 'Search leagues...',
    DIVISIONS: 'Search divisions by name, game type...',
    ADMINS: 'Search admins by name or email...',
    MATCHES: 'Search matches by player name, venue, division...',
  },
} as const;

export const TABLE_ICONS = {
  TROPHY: 'IconTrophy',
  CALENDAR: 'IconCalendar',
  USERS: 'IconUsers',
  USER: 'IconUser',
  MAP_PIN: 'IconMapPin',
  MAIL: 'IconMail',
  EYE: 'IconEye',
  EDIT: 'IconEdit',
  TRASH: 'IconTrash',
  DOTS_VERTICAL: 'IconDotsVertical',
  CHEVRON_DOWN: 'IconChevronDown',
  SEARCH: 'IconSearch',
  FILTER: 'IconFilter',
  CATEGORY: 'IconCategory',
  INFO_CIRCLE: 'IconInfoCircle',
  ADJUSTMENTS: 'IconAdjustments',
  ARROWS_MAXIMIZE: 'IconArrowsMaximize',
  ARROWS_MINIMIZE: 'IconArrowsMinimize',
  USER_CHECK: 'IconUserCheck',
  USER_X: 'IconUserX',
} as const;

export const ACTION_MESSAGES = {
  DELETE_CONFIRM: 'Are you sure you want to delete this item?',
  BULK_DELETE_CONFIRM: (count: number) => `Delete ${count} items requires confirmation`,
  SUCCESS: {
    DELETE: 'Item deleted successfully.',
    UPDATE: 'Item updated successfully.',
    CREATE: 'Item created successfully.',
    INVITE_SENT: 'Invite sent successfully!',
  },
  ERROR: {
    DELETE_FAILED: 'Failed to delete item.',
    UPDATE_FAILED: 'Failed to update item.',
    CREATE_FAILED: 'Failed to create item.',
    INVITE_FAILED: 'Failed to send invite',
    LOAD_FAILED: 'Failed to load data.',
  },
  INFO: {
    FEATURE_COMING_SOON: (feature: string) => `${feature} functionality coming soon`,
    EDIT_ADMIN_COMING_SOON: 'Edit admin functionality coming soon',
    SUSPEND_ADMIN_COMING_SOON: 'suspend admin functionality coming soon',
    ACTIVATE_ADMIN_COMING_SOON: 'activate admin functionality coming soon',
  },
} as const;

// ===== UTILITY FUNCTIONS =====

/**
 * Get the badge variant for a given entity and status
 * @param entity - The entity type
 * @param status - The status value
 * @returns The badge variant
 */
export const getStatusBadgeVariant = (
  entity: 'SEASON' | 'LEAGUE' | 'ADMIN' | 'DIVISION' | 'WITHDRAWAL' | 'MATCH' | 'INVITATION' | 'DISPUTE',
  status: string
) => {
  const variants = STATUS_BADGE_VARIANTS[entity];
  return variants[status as keyof typeof variants] || 'outline';
};

/**
 * Get the badge color classes for a given entity and status
 * @param entity - The entity type
 * @param status - The status value
 * @returns The color class string
 */
export const getStatusBadgeColor = (
  entity: 'SEASON' | 'LEAGUE' | 'ADMIN' | 'DIVISION' | 'WITHDRAWAL' | 'MATCH' | 'INVITATION' | 'DISPUTE',
  status: string
): string => {
  const colors = STATUS_BADGE_COLORS[entity];
  return colors[status as keyof typeof colors] || '';
};

/**
 * Get complete badge props (variant + color) for a given entity and status
 * Use this for the simplest implementation
 * @param entity - The entity type
 * @param status - The status value
 * @returns Object with variant and className
 */
export const getStatusBadgeProps = (
  entity: 'SEASON' | 'LEAGUE' | 'ADMIN' | 'DIVISION' | 'WITHDRAWAL' | 'MATCH' | 'INVITATION' | 'DISPUTE',
  status: string
) => {
  return {
    variant: getStatusBadgeVariant(entity, status),
    className: getStatusBadgeColor(entity, status),
  };
};

export const getGameTypeLabel = (gameType: string): string => {
  return GAME_TYPE_LABELS[gameType as keyof typeof GAME_TYPE_LABELS] || gameType;
};

export const getDivisionLevelLabel = (level: string): string => {
  return DIVISION_LEVEL_LABELS[level as keyof typeof DIVISION_LEVEL_LABELS] || level;
};

export const getGenderCategoryLabel = (category: string | null | undefined): string => {
  if (!category) return 'Missing Category';
  return GENDER_CATEGORY_LABELS[category as keyof typeof GENDER_CATEGORY_LABELS] || category;
};

export const formatTableDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'Not set';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    
    return dateObj.toLocaleDateString(DATE_FORMATS.LOCALE, DATE_FORMATS.TABLE_DISPLAY);
  } catch (error) {
    console.error('Error formatting date:', error, 'Input:', date);
    return 'Invalid date';
  }
};

export const formatCurrency = (
  amount: number | string | null | undefined,
  currency: 'MYR'
): string => {
  if (!amount) return 'Free';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return typeof amount === 'string' ? amount : 'Invalid amount';
  
  return new Intl.NumberFormat(DATE_FORMATS.LOCALE, CURRENCY_FORMATS[currency]).format(numAmount);
};

export const formatLocation = (location: string | null | undefined): string => {
  if (!location) return 'Not specified';
  
  return location
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
};

export const renderValue = (value: unknown): React.ReactNode => {
  return value === null || value === undefined || value === '' ? '-' : String(value);
};

export const formatCount = (value?: number | null): string => {
  return value === null || value === undefined ? '-' : String(value);
};

// Game Type Options by Sport
export const getGameTypeOptionsForSport = (sport: string): Array<{ value: string; label: string }> => {
  switch (sport) {
    case 'TENNIS':
      return [
        { value: 'SINGLES', label: 'Singles' },
        { value: 'DOUBLES', label: 'Doubles' },
        { value: 'MIXED', label: 'Mixed Doubles' },
      ];
    case 'PADEL':
      return [
        { value: 'DOUBLES', label: 'Doubles' },
        { value: 'MIXED', label: 'Mixed Doubles' },
        { value: 'SINGLES', label: 'Singles' },
      ];
    case 'PICKLEBALL':
      return [
        { value: 'SINGLES', label: 'Singles' },
        { value: 'DOUBLES', label: 'Doubles' },
        { value: 'MIXED', label: 'Mixed Doubles' },
      ];
    default:
      return [
        { value: 'SINGLES', label: 'Singles' },
        { value: 'DOUBLES', label: 'Doubles' },
        { value: 'MIXED', label: 'Mixed Doubles' },
      ];
  }
};

// Filter Options
export const FILTER_OPTIONS = {
  LEAGUE_STATUS: ['ACTIVE', 'UPCOMING', 'ONGOING', 'FINISHED', 'INACTIVE', 'CANCELLED', 'SUSPENDED'],
  SEASON_STATUS: ['UPCOMING', 'ACTIVE', 'FINISHED', 'CANCELLED'],
  ADMIN_STATUS: ['PENDING', 'ACTIVE', 'SUSPENDED'],
  MATCH_STATUS: ['DRAFT', 'SCHEDULED', 'ONGOING', 'COMPLETED', 'UNFINISHED', 'CANCELLED', 'VOID'],
  MATCH_TYPE: ['SINGLES', 'DOUBLES'],
  MATCH_FORMAT: ['STANDARD', 'ONE_SET'],
  SPORTS: ['TENNIS', 'PICKLEBALL', 'PADEL'],
  GAME_TYPES: ['SINGLES', 'DOUBLES', 'MIXED'],
  DIVISION_LEVELS: ['beginner', 'improver', 'intermediate', 'upper_intermediate', 'expert', 'advanced'],
  GENDER_CATEGORIES: ['male', 'female', 'mixed'],
} as const;

// Table Responsive Classes
export const RESPONSIVE_CLASSES = {
  CONTAINER: 'mx-1 lg:mx-2',
  PADDING: 'px-1 lg:px-2',
  MARGIN: 'mx-4 lg:mx-6',
  PADDING_LARGE: 'px-4 lg:px-6',
} as const;

// Animation Classes for Tables
export const TABLE_ANIMATIONS = {
  LOADING_SPINNER: 'animate-spin rounded-full h-4 w-4 border-b-2 border-primary',
  ROW_HOVER: 'hover:bg-muted/50',
  TRANSITION: 'transition-colors',
  FADE_IN: 'animate-in fade-in-0 duration-200',
} as const;

// Match-specific labels
export const MATCH_STATUS_LABELS = {
  DRAFT: 'Draft',
  SCHEDULED: 'Scheduled',
  ONGOING: 'In Progress',
  COMPLETED: 'Completed',
  UNFINISHED: 'Unfinished',
  CANCELLED: 'Cancelled',
  VOID: 'Voided',
} as const;

export const CANCELLATION_REASON_LABELS = {
  PERSONAL_EMERGENCY: 'Personal Emergency',
  INJURY: 'Injury',
  WEATHER: 'Weather',
  SCHEDULING_CONFLICT: 'Scheduling Conflict',
  ILLNESS: 'Illness',
  WORK_COMMITMENT: 'Work Commitment',
  FAMILY_EMERGENCY: 'Family Emergency',
  OTHER: 'Other',
} as const;

export const WALKOVER_REASON_LABELS = {
  NO_SHOW: 'No Show',
  LATE_CANCELLATION: 'Late Cancellation',
  INJURY: 'Injury',
  PERSONAL_EMERGENCY: 'Personal Emergency',
  OTHER: 'Other',
} as const;

// Helper functions
export const getMatchStatusLabel = (status: string): string => {
  return MATCH_STATUS_LABELS[status as keyof typeof MATCH_STATUS_LABELS] || status;
};

export const getCancellationReasonLabel = (reason: string): string => {
  return CANCELLATION_REASON_LABELS[reason as keyof typeof CANCELLATION_REASON_LABELS] || reason;
};

export const getWalkoverReasonLabel = (reason: string): string => {
  return WALKOVER_REASON_LABELS[reason as keyof typeof WALKOVER_REASON_LABELS] || reason;
};