import { createFileRoute } from "@tanstack/react-router";
import AdminsWrapper from "@/components/wrappers/adminpagewrapper";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminsPage,
});

function AdminsPage() {
  return <AdminsWrapper />;
}
