"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconArrowRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ReportCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  metrics?: {
    label: string;
    value: string | number;
  }[];
  status?: "available" | "coming-soon";
  className?: string;
}

export function ReportCard({
  title,
  description,
  icon: Icon,
  href,
  metrics,
  status = "available",
  className,
}: ReportCardProps) {
  const isAvailable = status === "available";

  const content = (
    <Card className={cn(
      "group relative overflow-hidden transition-all hover:shadow-md",
      !isAvailable && "opacity-60",
      className
    )}>
      {!isAvailable && (
        <div className="absolute top-3 right-3">
          <span className="text-xs font-medium bg-muted px-2 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="size-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-sm">
          {description}
        </CardDescription>

        {metrics && metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((metric, idx) => (
              <div key={idx} className="bg-muted/50 rounded-lg p-2">
                <div className="text-xs text-muted-foreground">{metric.label}</div>
                <div className="text-sm font-semibold">{metric.value}</div>
              </div>
            ))}
          </div>
        )}

        {isAvailable && (
          <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/10">
            View Report
            <IconArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (isAvailable) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
