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
    ACTIVE: 'outline',
    INACTIVE: 'default',
  },
} as const;


export const CUSTOM_BADGE_COLORS = {
  ADMIN_STATUS: {
    ACTIVE: 'bg-green-300 text-black-800',
    PENDING: 'bg-yellow-300 text-black-800',
    SUSPENDED: 'bg-red-300 text-white-800',
  },
} as const;

// Sport Colors
export const SPORT_COLORS = {
  TENNIS: '#518516ff',
  PICKLEBALL: '#8e41e6ff',
  PADEL: '#3880c0ff',
} as const;

// Sport Display Names
export const SPORT_LABELS = {
  TENNIS: 'Tennis',
  PICKLEBALL: 'Pickleball',
  PADEL: 'Padel',
} as const;

// Game Type Labels
export const GAME_TYPE_LABELS = {
  SINGLES: 'Singles',
  DOUBLES: 'Doubles',
  MIXED: 'Mixed Doubles',
  // Alternative casing
  singles: 'Singles',
  doubles: 'Doubles',
  mixed: 'Mixed Doubles',
} as const;

// Division Level Labels
export const DIVISION_LEVEL_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
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

// Utility Functions
export const getStatusBadgeVariant = (
  entity: 'SEASON' | 'LEAGUE' | 'ADMIN' | 'DIVISION',
  status: string
) => {
  const variants = STATUS_BADGE_VARIANTS[entity];
  return variants[status as keyof typeof variants] || 'outline';
};

export const getSportColor = (sport: string): string => {
  return SPORT_COLORS[sport as keyof typeof SPORT_COLORS];
};

export const getSportLabel = (sport: string): string => {
  return SPORT_LABELS[sport as keyof typeof SPORT_LABELS] || sport;
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
  SPORTS: ['TENNIS', 'PICKLEBALL', 'PADEL'],
  GAME_TYPES: ['SINGLES', 'DOUBLES', 'MIXED'],
  DIVISION_LEVELS: ['beginner', 'intermediate', 'advanced'],
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