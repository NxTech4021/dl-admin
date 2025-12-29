import { getSportColors, type SportType } from "@/lib/sport-colors";

interface ChatContextBadgeProps {
  seasonName?: string;
  sportType?: SportType | string;
}

export default function ChatContextBadge({
  seasonName,
  sportType,
}: ChatContextBadgeProps) {
  if (!seasonName) return null;

  const sportColors = getSportColors(sportType);

  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
      style={{
        backgroundColor: sportColors.badgeBg,
        color: sportColors.badgeColor,
      }}
    >
      {seasonName}
    </span>
  );
}
