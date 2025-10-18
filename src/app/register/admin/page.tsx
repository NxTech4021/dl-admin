"use client";

import { AdminRegisterForm } from "@/components/admin-register-form";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default function Page() {
  return (
    <div className="bg-muted flex min-h-screen flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Image
            src="/dl-logo.svg"
            alt="Deuce League Logo"
            className="w-8 h-8"
            width={32}
            height={32}
          />
          {/* <img src="/dl-logo.svg" alt="Deuce League Logo" className="w-8 h-8" /> */}
          <span className="text-2xl font-bold italic text-orange-500 tracking-tight">
            DEUCE
          </span>
        </Link>
        <Suspense fallback={<div>Loading...</div>}>
          <AdminRegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
