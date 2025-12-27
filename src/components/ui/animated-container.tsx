"use client";

import * as React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  statsGridContainer,
  statsCardVariants,
  tableContainerVariants,
  tableRowVariants,
  filterBarVariants,
  gridContainerVariants,
  gridItemVariants,
  emptyStateVariants,
  defaultTransition,
  fastTransition,
} from "@/lib/animation-variants";

// Shared animation variants
const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

interface AnimatedContainerProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedContainer({
  children,
  delay = 0,
  className,
}: AnimatedContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger container for groups of items
interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.05,
  className,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: staggerDelay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Individual stagger item
interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div
      variants={fadeInVariants}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// STATS GRID COMPONENTS
// ============================================

interface AnimatedStatsGridProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedStatsGrid({ children, className }: AnimatedStatsGridProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={statsGridContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedStatsCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedStatsCard({ children, className }: AnimatedStatsCardProps) {
  return (
    <motion.div
      variants={statsCardVariants}
      transition={defaultTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// TABLE ANIMATION COMPONENTS
// ============================================

interface AnimatedTableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedTableBody({ children, className }: AnimatedTableBodyProps) {
  return (
    <motion.tbody
      initial="hidden"
      animate="visible"
      variants={tableContainerVariants}
      className={className}
    >
      {children}
    </motion.tbody>
  );
}

interface AnimatedTableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function AnimatedTableRow({ children, className, onClick }: AnimatedTableRowProps) {
  return (
    <motion.tr
      variants={tableRowVariants}
      transition={fastTransition}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.tr>
  );
}

// ============================================
// FILTER BAR COMPONENT
// ============================================

interface AnimatedFilterBarProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedFilterBar({ children, className }: AnimatedFilterBarProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={filterBarVariants}
      transition={defaultTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// GRID COMPONENTS (for report cards, etc.)
// ============================================

interface AnimatedGridProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedGrid({ children, className }: AnimatedGridProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={gridContainerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedGridItemProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedGridItem({ children, className }: AnimatedGridItemProps) {
  return (
    <motion.div
      variants={gridItemVariants}
      transition={defaultTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================

interface AnimatedEmptyStateProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedEmptyState({ children, className }: AnimatedEmptyStateProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={emptyStateVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
