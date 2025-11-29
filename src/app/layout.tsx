import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/lib/query-client";
import { ErrorBoundary } from "@/components/error-boundary";
import { BugReportWidget } from "@/components/bug-report/BugReportWidget";
import { CommandPalette } from "@/components/command-palette";
import { ModalProvider } from "@/contexts/modal-context";
import { GlobalModals } from "@/components/global-modals";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "DeuceLeague Dashboard",
  icons: {
    icon: "/dl-logo.svg",
    shortcut: "/dl-logo.svg",
    apple: "/dl-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <QueryProvider>
            <ModalProvider>
              {children}
              <CommandPalette />
              <GlobalModals />
            </ModalProvider>
          </QueryProvider>
        </ErrorBoundary>
        <Toaster position="bottom-right" />
        <BugReportWidget />
      </body>
    </html>
  );
}
