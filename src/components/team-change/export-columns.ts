import type { ExportColumn } from "@/components/shared/export-button";
import type {
  WithdrawalRequestAdmin,
  DissolvedPartnership,
} from "@/constants/zod/partnership-admin-schema";
import { formatDateTime } from "./utils";

export const withdrawalExportColumns: ExportColumn<WithdrawalRequestAdmin>[] = [
  { key: "partnership.captain.name", header: "Captain" },
  { key: "partnership.captain.email", header: "Captain Email" },
  { key: "partnership.captain.username", header: "Captain Username" },
  { key: "partnership.partner.name", header: "Partner" },
  { key: "partnership.partner.email", header: "Partner Email" },
  { key: "partnership.division.name", header: "Division" },
  { key: "user.name", header: "Who Left" },
  { key: "user.email", header: "Who Left Email" },
  { key: "reason", header: "Reason" },
  { key: "season.name", header: "Season" },
  { key: "status", header: "Status" },
  { key: "requestDate", header: "Request Date", formatter: (v) => formatDateTime(v as string) },
];

export const dissolvedExportColumns: ExportColumn<DissolvedPartnership>[] = [
  { key: "captain.name", header: "Captain" },
  { key: "captain.email", header: "Captain Email" },
  { key: "captain.username", header: "Captain Username" },
  { key: "partner.name", header: "Partner" },
  { key: "partner.email", header: "Partner Email" },
  { key: "division.name", header: "Division" },
  { key: "season.name", header: "Season" },
  { key: "status", header: "Status" },
  { key: "dissolvedAt", header: "Dissolved Date", formatter: (v) => formatDateTime(v as string) },
  { key: "withdrawalRequest.user.name", header: "Who Left" },
  { key: "withdrawalRequest.reason", header: "Reason" },
  {
    key: "successors",
    header: "New Partnership",
    formatter: (_, row) => row.successors && row.successors.length > 0
      ? `${row.successors[0].captain?.name || "Unknown"}${row.successors[0].partner ? ` & ${row.successors[0].partner.name}` : " (finding partner)"}`
      : "None"
  },
];
