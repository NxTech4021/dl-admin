import { Metadata } from "next";

export const metadata: Metadata = {
  title: "DeuceLeague",
  description: "Sign in",
  icons: {
    icon: "/dl-logo.svg",
    shortcut: "/dl-logo.svg",
    apple: "/dl-logo.svg",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
