import { Variants, Transition } from "framer-motion";

// ============================================
// TIMING CONSTANTS
// ============================================
export const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.4,
} as const;

export const STAGGER_DELAY = {
  fast: 0.04,
  normal: 0.05,
  slow: 0.08,
} as const;

// Standard easing matching existing patterns (Material Design cubic-bezier)
export const EASE_SMOOTH: [number, number, number, number] = [0.4, 0, 0.2, 1];

// Spring configuration for interactive elements (matching chat badges)
export const SPRING_CONFIG = {
  stiffness: 500,
  damping: 25,
};

// ============================================
// ACCESSIBILITY
// ============================================
export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ============================================
// FADE-IN VARIANTS
// ============================================
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0 },
};

// ============================================
// CONTAINER VARIANTS (for staggering children)
// ============================================
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER_DELAY.normal,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER_DELAY.fast,
    },
  },
};

// ============================================
// STATS CARD VARIANTS
// ============================================
export const statsCardVariants: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
};

export const statsGridContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER_DELAY.fast,
      delayChildren: 0.1,
    },
  },
};

// ============================================
// TABLE ROW VARIANTS
// ============================================
export const tableRowVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0 },
};

export const tableContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER_DELAY.fast,
      delayChildren: 0.15,
    },
  },
};

// ============================================
// FILTER BAR VARIANTS
// ============================================
export const filterBarVariants: Variants = {
  hidden: { opacity: 0, y: -4 },
  visible: { opacity: 1, y: 0 },
};

// ============================================
// REPORT CARD / GRID ITEM VARIANTS
// ============================================
export const gridItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const gridContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER_DELAY.normal,
      delayChildren: 0.1,
    },
  },
};

// ============================================
// EMPTY STATE VARIANTS
// ============================================
export const emptyStateVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.slow,
      ease: EASE_SMOOTH,
    },
  },
};

// ============================================
// PAGE SECTION VARIANTS
// ============================================
export const pageSectionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASE_SMOOTH,
    },
  },
};

// ============================================
// SETTINGS CARD VARIANTS
// ============================================
export const settingsCardVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

export const settingsContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// ============================================
// TRANSITION PRESETS
// ============================================
export const defaultTransition: Transition = {
  duration: ANIMATION_DURATION.normal,
  ease: EASE_SMOOTH,
};

export const fastTransition: Transition = {
  duration: ANIMATION_DURATION.fast,
  ease: EASE_SMOOTH,
};

export const slowTransition: Transition = {
  duration: ANIMATION_DURATION.slow,
  ease: EASE_SMOOTH,
};
