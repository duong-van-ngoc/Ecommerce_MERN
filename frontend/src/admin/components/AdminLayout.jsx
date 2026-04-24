import RequireAdmin from "@/app/guards/RequireAdmin";
import AppAdminLayout from "@/app/layouts/AdminLayout";

function AdminLayout() {
  return (
    <RequireAdmin>
      <AppAdminLayout />
    </RequireAdmin>
  );
}

export default AdminLayout;
