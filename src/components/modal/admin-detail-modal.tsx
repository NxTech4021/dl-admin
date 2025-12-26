"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  IconMail,
  IconCalendar,
  IconExternalLink,
  IconHash,
  IconShield,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Admin } from "@/constants/zod/admin-schema";
import { Link } from "@tanstack/react-router";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case "ACTIVE":
      return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
    case "PENDING":
      return "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
    case "SUSPENDED":
      return "text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800";
    case "INACTIVE":
      return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700";
    default:
      return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700";
  }
};

const formatStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

interface AdminDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: Admin | null;
}

export default function AdminDetailModal({
  open,
  onOpenChange,
  admin,
}: AdminDetailModalProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  if (!admin) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-4">
          {/* Avatar and Name */}
          <div className="flex items-start gap-4">
            <Avatar className="size-14 border-2 border-border">
              <AvatarImage src={admin.image || undefined} alt={admin.name} />
              <AvatarFallback className="text-lg bg-muted">
                {getInitials(admin.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-1">
              <DialogTitle className="text-lg">{admin.name}</DialogTitle>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <IconHash className="size-3" />
                <code className="font-mono text-[11px] select-all truncate">
                  {admin.id}
                </code>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("text-xs border", getStatusBadgeClass(admin.status))}
            >
              <IconShield className="size-3 mr-1" />
              {formatStatus(admin.status)}
            </Badge>
            {admin.role && (
              <Badge variant="secondary" className="text-xs">
                {admin.role}
              </Badge>
            )}
          </div>

          {/* Email */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconMail className="size-4" />
            <span>{admin.email}</span>
          </div>

          {/* Created date */}
          {admin.createdAt && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t">
              <IconCalendar className="size-3.5" />
              <span>
                Created{" "}
                {new Date(admin.createdAt).toLocaleDateString("en-MY", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Close
          </Button>
          <Button size="sm" asChild>
            <Link
              to="/admin/$adminId"
              params={{ adminId: admin.id }}
              onClick={handleClose}
              className="flex items-center"
            >
              <IconExternalLink className="size-4 mr-1.5" />
              View Full Profile
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
