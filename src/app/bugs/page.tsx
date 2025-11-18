import { Metadata } from "next";
import BugDashboard from "@/components/bug-report/BugDashboard";

export const metadata: Metadata = {
  title: "Bug Reports",
  description: "DeuceLeague Bug Report Management",
  icons: {
    icon: "/dl-logo.svg",
    shortcut: "/dl-logo.svg",
    apple: "/dl-logo.svg",
  },
};

export default function BugsPage() {
  return <BugDashboard />;
}
