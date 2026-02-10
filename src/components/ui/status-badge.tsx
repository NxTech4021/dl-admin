import { Badge } from '@/components/ui/badge';
import { getStatusBadgeProps } from '@/components/data-table/constants';

interface StatusBadgeProps {
  entity: 'SEASON' | 'LEAGUE' | 'ADMIN' | 'DIVISION' | 'WITHDRAWAL';
  status: string;
  additionalClassName?: string;
  formatLabel?: (status: string) => string;
}

/**
 * Centralized status badge component with automatic color palette
 * No need to manually specify colors - they're all managed in constants.ts
 * 
 * @example
 * // Simple usage:
 * <StatusBadge entity="SEASON" status="ACTIVE" />
 * 
 * // With custom label formatting:
 * <StatusBadge 
 *   entity="LEAGUE" 
 *   status="UPCOMING"
 *   formatLabel={(s) => s.toLowerCase()} 
 * />
 */
export function StatusBadge({ 
  entity, 
  status, 
  additionalClassName = '',
  formatLabel = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}: StatusBadgeProps) {
  const { variant, className } = getStatusBadgeProps(entity, status);
  
  return (
    <Badge 
      variant={variant as "default" | "secondary" | "destructive" | "outline"}
      className={`capitalize ${className} ${additionalClassName}`.trim()}
    >
      {formatLabel(status)}
    </Badge>
  );
}