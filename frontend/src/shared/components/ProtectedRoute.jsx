import RequireAuth from "@/app/guards/RequireAuth";

function ProtectedRoute(props) {
  return <RequireAuth {...props} />;
}

export default ProtectedRoute;
