import { useSelector } from "react-redux";

import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "@/features/auth/authSelectors";
import AIChatBubble from "@/features/chat/components/AIChatBubble";
import UserDashboard from "@/Pages/user/UserDashboard";

function AppOverlays() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  return (
    <>
      {isAuthenticated && <UserDashboard user={user} />}
      <AIChatBubble />
    </>
  );
}

export default AppOverlays;
