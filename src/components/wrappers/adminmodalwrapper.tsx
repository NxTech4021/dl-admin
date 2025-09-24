// AdminInviteModalWrapper.tsx
"use client";
import { useState } from "react";
import AdminInviteModal from "../modal/admin-invite-modal";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { IconPlus } from "@tabler/icons-react";

export default function AdminInviteModalWrapper() {
  const [open, setOpen] = useState(false);

  return (
    <AdminInviteModal open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <IconPlus className="mr-2 size-4" />
          Add Admin
        </Button>
      </DialogTrigger>
    </AdminInviteModal>
  );
}
