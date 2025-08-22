"use client";

import { AdminRegisterForm } from "@/components/admin-register-form";

export default function Page() {
  return (
    <div className="bg-muted flex min-h-screen flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <img src="/dl-logo.svg" alt="Deuce League Logo" className="w-8 h-8" />
          <span className="text-2xl font-bold italic text-orange-500 tracking-tight">
            DEUCE
          </span>
        </a>
        <AdminRegisterForm />
      </div>
    </div>
  );
}
