import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "@/features/auth/authSelectors";
import { fetchCart, syncCartWithUser } from "@/features/cart/cartSlice";
import { loaderUser } from "@/features/user/userSlice";

function AppBootstrap({ children }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(loaderUser());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const userId = user?._id ?? null;

    dispatch(syncCartWithUser(userId));

    if (userId) {
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

  return children;
}

export default AppBootstrap;
