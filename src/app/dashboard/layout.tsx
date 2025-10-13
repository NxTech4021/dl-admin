import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",

  description: "DeuceLeague Dashboard",

  icons: {
    icon: "/dl-logo.svg",

    shortcut: "/dl-logo.svg",

    apple: "/dl-logo.svg",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
