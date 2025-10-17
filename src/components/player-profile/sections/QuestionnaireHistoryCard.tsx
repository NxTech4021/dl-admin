import { IconListCheck, IconUserCheck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlayerProfileData } from "../types";
import { formatDate } from "../utils";

interface QuestionnaireHistoryCardProps {
  profile: PlayerProfileData;
}

export function QuestionnaireHistoryCard({
  profile,
}: QuestionnaireHistoryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconListCheck className="size-5" />
          Questionnaire History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sport</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Singles</TableHead>
              <TableHead>Doubles</TableHead>
              <TableHead>Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profile.questionnaires.map((q, index) => (
              <TableRow key={index}>
                <TableCell className="capitalize font-medium">
                  {q.sport}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    v{q.qVersion}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(q.startedAt)}
                </TableCell>
                <TableCell>
                  {q.completedAt ? (
                    <div className="flex items-center gap-2">
                      <IconUserCheck className="size-4 text-green-600" />
                      <span className="text-sm">
                        {formatDate(q.completedAt)}
                      </span>
                    </div>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Incomplete
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="font-mono">
                  {q.result?.singles || "N/A"}
                </TableCell>
                <TableCell className="font-mono">
                  {q.result?.doubles || "N/A"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`capitalize text-xs ${
                      q.result?.confidence === "high"
                        ? "text-green-600"
                        : q.result?.confidence === "medium"
                          ? "text-yellow-600"
                          : q.result?.confidence === "low"
                            ? "text-red-600"
                            : ""
                    }`}
                  >
                    {q.result?.confidence || "N/A"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

