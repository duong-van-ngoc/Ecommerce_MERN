import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import { selectCurrentUser } from "@/features/auth/authSelectors";
import DashboardLayout from "@/admin/components/premium-dashboard/DashboardLayout";

function AdminLayout() {
  const user = useSelector(selectCurrentUser);

  return (
    <DashboardLayout user={user}>
      <Outlet />
    </DashboardLayout>
  );
}

export default AdminLayout;
