// AdminInviteModalWrapper.tsx
"use client";
import { useState } from "react";
import AdminInviteModal from "../modal/admin-invite-modal";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";

export default function AdminInviteModalWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setIsOpen(true)}>
        <IconPlus className="mr-2 size-4" />
        Add Admin
      </Button>

      <AdminInviteModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
