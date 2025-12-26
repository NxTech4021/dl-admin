import { memo, useMemo } from "react";
import { formatDistanceToNowStrict, format } from "date-fns";
import {
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Circle,
  Users,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getSportColors } from "@/lib/sport-colors";
import type { Message, MatchData, MatchParticipant } from "@/constants/types/chat";

interface MatchMessageCardProps {
  message: Message;
  senderDetails: {
    firstName: string;
    avatarUrl?: string;
  };
}

function MatchMessageCard({ message, senderDetails }: MatchMessageCardProps) {
  const matchData = message.matchData as MatchData;
  const { firstName, avatarUrl } = senderDetails;
  const createdAt = message.createdAt;

  const sportColors = useMemo(
    () => getSportColors(matchData?.sportType),
    [matchData?.sportType]
  );

  // Format display date
  const formatDisplayDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d MMM yyyy");
    } catch {
      return dateString;
    }
  };

  // Extract start time from range
  const extractStartTime = (timeRange: string): string => {
    if (!timeRange) return "12:00 PM";
    if (timeRange.includes(" - ")) {
      return timeRange.split(" - ")[0].trim();
    }
    return timeRange.trim();
  };

  // Format time to 12-hour format
  const formatTime = (timeString: string) => {
    if (!timeString) return "TBD";
    if (timeString.includes("M")) return timeString;
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Calculate end time
  const calculateEndTime = (startTime: string, durationHours: number) => {
    const actualStartTime = extractStartTime(startTime);
    const [time, modifier] = actualStartTime.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    let startHour = modifier === "PM" && hours !== 12 ? hours + 12 : hours;
    if (modifier === "AM" && hours === 12) startHour = 0;

    const totalMinutes = startHour * 60 + minutes + durationHours * 60;
    const endHour = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;

    const displayEndHour = endHour % 12 || 12;
    const endModifier = endHour >= 12 ? "PM" : "AM";
    return `${displayEndHour}:${String(endMinutes).padStart(2, "0")} ${endModifier}`;
  };

  // Format fee display
  const formatFee = () => {
    const fee = matchData?.fee;
    const feeAmount = matchData?.feeAmount;

    if (fee === "FREE" || !fee) return "Free";
    if (fee === "SPLIT" && feeAmount) {
      const totalAmount = parseFloat(feeAmount);
      const numPlayers = parseInt(matchData?.numberOfPlayers || "2", 10);
      const perPlayer = numPlayers > 0 ? (totalAmount / numPlayers).toFixed(2) : "0.00";
      return `RM${perPlayer}/player`;
    }
    if (fee === "FIXED" && feeAmount) {
      return `RM${parseFloat(feeAmount).toFixed(2)}/player`;
    }
    return "Free";
  };

  // Get match type label
  const getMatchTypeLabel = () => {
    if (matchData?.matchType === "SINGLES" || matchData?.numberOfPlayers === "2") {
      return "Singles";
    }
    return "Doubles";
  };

  // Get expected number of players
  const getExpectedPlayers = () => {
    if (matchData?.matchType === "SINGLES" || matchData?.numberOfPlayers === "2") {
      return 2;
    }
    return 4;
  };

  const participants = matchData?.participants || [];
  const acceptedParticipants = participants.filter(
    (p) => p.invitationStatus === "ACCEPTED" || !p.invitationStatus
  );
  const expectedPlayers = getExpectedPlayers();

  const startTime = matchData?.time ? extractStartTime(matchData.time) : "12:00 PM";
  const formattedStartTime = formatTime(startTime);
  const formattedEndTime = calculateEndTime(startTime, matchData?.duration || 2);

  const isFriendly = matchData?.isFriendly || matchData?.isFriendlyRequest;
  const matchTypeLabel = getMatchTypeLabel();

  // Get participant display name
  const getParticipantName = (participant: MatchParticipant) => {
    if (participant.name) return participant.name;
    if (participant.username) return participant.username;
    return `User ${participant.userId?.slice(-6) || "???"}`;
  };

  // Get status icon and color
  const getStatusInfo = (status: string | undefined) => {
    switch (status) {
      case "ACCEPTED":
        return { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" };
      case "DECLINED":
        return { icon: XCircle, color: "text-red-500", bg: "bg-red-50" };
      case "PENDING":
        return { icon: Circle, color: "text-amber-500", bg: "bg-amber-50" };
      default:
        return { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" };
    }
  };

  return (
    <div className="group flex gap-3 py-2 px-4 md:px-6">
      {/* Sender Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0 mt-0.5 border border-border/50">
        <AvatarImage src={avatarUrl} alt={firstName} />
        <AvatarFallback className="text-[11px] bg-muted font-medium text-muted-foreground">
          {firstName?.charAt(0)?.toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col flex-1 min-w-0 max-w-[420px]">
        {/* Header Row */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[13px] text-muted-foreground">
            <span className="font-semibold text-foreground">{firstName}</span>
            {isFriendly ? " sent a friendly match request" : " posted a league match"}
          </span>
          <span className="text-[11px] text-muted-foreground/50 ml-auto tabular-nums">
            {formatDistanceToNowStrict(new Date(createdAt), { addSuffix: true })}
          </span>
        </div>

        {/* Match Card */}
        <div
          className="rounded-xl border bg-card overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.05),0_1px_4px_rgba(0,0,0,0.04)]"
          style={{ borderColor: `${sportColors.badgeColor}25` }}
        >
          {/* Title Row */}
          <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-border/40">
            <span className="font-semibold text-[13px] text-foreground">
              {matchTypeLabel} {isFriendly ? "Friendly" : "League Match"}
            </span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${sportColors.badgeColor}15`,
                color: sportColors.badgeColor,
              }}
            >
              {sportColors.label}
            </span>
          </div>

          {/* Content Row - Two Columns */}
          <div className="px-3.5 py-3 flex gap-4">
            {/* Left Column - Match Details */}
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
                <span className="truncate">{matchData?.location || "TBD"}</span>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
                <span>{formatDisplayDate(matchData?.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <Clock className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
                <span>{formattedStartTime} – {formattedEndTime}</span>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
                <span>{formatFee()}</span>
              </div>
            </div>

            {/* Right Column - Status Badges */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {/* Court Status */}
              <div
                className={cn(
                  "flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded",
                  matchData?.courtBooked
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-500"
                )}
              >
                <span>{matchData?.courtBooked ? "Court booked" : "No court"}</span>
                {matchData?.courtBooked ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
              </div>

              {/* Request Status for Friendly */}
              {matchData?.isFriendlyRequest && matchData?.requestStatus && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded",
                    matchData.requestStatus === "ACCEPTED" && "bg-emerald-50 text-emerald-600",
                    matchData.requestStatus === "DECLINED" && "bg-red-50 text-red-500",
                    matchData.requestStatus === "EXPIRED" && "bg-gray-100 text-gray-500",
                    matchData.requestStatus === "PENDING" && "bg-amber-50 text-amber-600"
                  )}
                >
                  {matchData.requestStatus === "ACCEPTED" && "Accepted"}
                  {matchData.requestStatus === "DECLINED" && "Declined"}
                  {matchData.requestStatus === "EXPIRED" && "Expired"}
                  {matchData.requestStatus === "PENDING" && "Pending"}
                </div>
              )}

              {/* Match Status */}
              {matchData?.status && matchData.status !== "SCHEDULED" && (
                <div
                  className={cn(
                    "text-[10px] font-medium px-2 py-0.5 rounded",
                    matchData.status === "COMPLETED" && "bg-blue-50 text-blue-600",
                    matchData.status === "CANCELLED" && "bg-gray-100 text-gray-500",
                    matchData.status === "ONGOING" && "bg-amber-50 text-amber-600"
                  )}
                >
                  {matchData.status}
                </div>
              )}
            </div>
          </div>

          {/* Participants Section */}
          <div className="px-3.5 py-2.5 border-t border-border/40 bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                <Users className="h-3.5 w-3.5 opacity-60" />
                <span>Players</span>
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {acceptedParticipants.length}/{expectedPlayers}
              </span>
            </div>

            <div className="space-y-1">
              {participants.map((participant, index) => {
                const statusInfo = getStatusInfo(participant.invitationStatus);
                const StatusIcon = statusInfo.icon;
                return (
                  <div
                    key={participant.id || participant.userId || index}
                    className="flex items-center gap-2 py-1 px-2 rounded-md bg-background/60"
                  >
                    <Avatar className="h-5 w-5 border border-border/30">
                      <AvatarImage src={participant.image} alt={getParticipantName(participant)} />
                      <AvatarFallback className="text-[8px] bg-muted font-medium">
                        {getParticipantName(participant).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 flex items-center gap-1.5">
                      <span className="text-[12px] font-medium text-foreground truncate">
                        {getParticipantName(participant)}
                      </span>
                      {participant.role === "CREATOR" && (
                        <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium">
                          Host
                        </span>
                      )}
                      {participant.team && (
                        <span className="text-[9px] text-muted-foreground">
                          T{participant.team === "team1" ? "1" : "2"}
                        </span>
                      )}
                    </div>
                    <StatusIcon className={cn("h-3.5 w-3.5", statusInfo.color)} />
                  </div>
                );
              })}

              {/* Empty Slots */}
              {participants.length < expectedPlayers &&
                Array.from({ length: expectedPlayers - participants.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="flex items-center gap-2 py-1 px-2 rounded-md border border-dashed border-border/50"
                  >
                    <div className="h-5 w-5 rounded-full bg-muted/50 flex items-center justify-center">
                      <Users className="h-2.5 w-2.5 text-muted-foreground/40" />
                    </div>
                    <span className="text-[11px] text-muted-foreground/50 italic">
                      Waiting for player...
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(MatchMessageCard);
