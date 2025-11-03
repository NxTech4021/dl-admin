 
import React from "react";
import {
  IconChevronDown,
  IconDatabase,
  IconUserCheck,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TabsContent } from "@/components/ui/tabs";
import { PlayerProfileData } from "../utils/types";
import { formatDate, formatQuestionKey, formatAnswerValue } from "../utils/utils";

interface RawDataTabProps {
  profile: PlayerProfileData;
}

export function RawDataTab({ profile }: RawDataTabProps) {
  return (
    <TabsContent value="raw_data">
      <div className="space-y-6">
        {profile.questionnaires.length > 0 ? (
          <div className="space-y-6">
            {profile.questionnaires.map((q, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg capitalize">
                        {q.sport} Questionnaire
                      </CardTitle>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          Version {q.qVersion}
                        </Badge>
                        <span>Started {formatDate(q.startedAt)}</span>
                        {q.completedAt && (
                          <>
                            <span>•</span>
                            <span>Completed {formatDate(q.completedAt)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {q.completedAt ? (
                      <Badge className="bg-green-600 text-white">
                        <IconUserCheck className="size-3 mr-1" />
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="secondary">In Progress</Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <Collapsible>
                    <CollapsibleTrigger className="flex w-full items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm font-medium">
                        View Responses
                      </span>
                      <IconChevronDown className="size-4 transition-transform data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <div className="space-y-4">
                        {Object.entries(q.answersJson).map(([key, value]) => (
                          <div key={key} className="border rounded-lg p-4">
                            <h4 className="font-medium text-sm mb-3 text-foreground">
                              {formatQuestionKey(key)}
                            </h4>
                            <div className="text-sm">
                              {typeof value === "object" && value !== null ? (
                                <div className="space-y-3">
                                  {Object.entries(value).map(
                                    ([subKey, subValue]) => (
                                      <div
                                        key={subKey}
                                        className="flex items-start gap-3"
                                      >
                                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2"></div>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium text-xs text-muted-foreground mb-1">
                                            {subKey
                                              .replace(/_/g, " ")
                                              .replace(/([A-Z])/g, " $1")
                                              .replace(/^./, (str) =>
                                                str.toUpperCase()
                                              )}
                                          </div>
                                          <div className="text-sm break-words">
                                            {String(subValue)}
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <div className="text-sm break-words">
                                  {formatAnswerValue(value)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <IconDatabase className="size-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Questionnaire Data
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                This player hasn&apos;t completed any questionnaires yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </TabsContent>
  );
}

