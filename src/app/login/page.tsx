import { LoginForm } from "@/components/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <Image
            src="/dl-logo.svg"
            alt="Deuce League Logo"
            className="size-8"
            width={100}
            height={100}
          />
          <span className="text-2xl font-bold italic text-orange-500 tracking-tight">
            DEUCE
          </span>
        </a>
        <LoginForm />
      </div>
    </div>
  );
}
