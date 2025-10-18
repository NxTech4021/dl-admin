import { Metadata } from "next"
import AdminsWrapper from "@/components/wrappers/adminpagewrapper"

export const metadata: Metadata = {
  title: "Admins",
  description: "DeuceLeague Admin Management",
  icons: {
    icon: "/dl-logo.svg",
    shortcut: "/dl-logo.svg",
    apple: "/dl-logo.svg",
  },
};

export default async function Page() {

  return <AdminsWrapper />;
}

