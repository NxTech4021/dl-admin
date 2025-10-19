import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SocketProvider } from "@/context/socket-context";
import { Toaster } from "sonner";
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
        <SocketProvider>
         {children}
        </SocketProvider>
      
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
