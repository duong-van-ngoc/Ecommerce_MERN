import React, { useEffect } from "react";
import { Bell, Search, ShoppingCart, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useHomeSearch from "@/features/home/hooks/useHomeSearch";
import { fetchNotifications } from "@/features/notification/notificationSlice";

function HomeHeader() {
  const dispatch = useDispatch();
  const { searchQuery, handleSearchChange, handleSearchSubmit } = useHomeSearch();
  const { isAuthenticated } = useSelector((state) => state.user);
  const { cartItems = [] } = useSelector((state) => state.cart);
  const { unreadCount = 0 } = useSelector((state) => state.notification);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <header className="home-header">
      <div className="home-header-inner">
        <Link to="/" className="home-header-logo" aria-label="Trang chủ ToBi Shop">
          ToBi Shop
        </Link>

        <form className="home-header-search" onSubmit={handleSearchSubmit}>
          <Search size={19} aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm sản phẩm..."
            aria-label="Tìm kiếm sản phẩm"
          />
        </form>

        <div className="home-header-actions">
          <Link
            to={isAuthenticated ? "/notifications" : "/login"}
            className="home-header-icon"
            aria-label="Thông báo"
          >
            <Bell size={22} aria-hidden="true" />
            {isAuthenticated && unreadCount > 0 && (
              <span>{unreadCount > 99 ? "99+" : unreadCount}</span>
            )}
          </Link>

          <Link to="/cart" className="home-header-icon" aria-label="Giỏ hàng">
            <ShoppingCart size={22} aria-hidden="true" />
            {cartItems.length > 0 && <span>{cartItems.length > 99 ? "99+" : cartItems.length}</span>}
          </Link>

          <Link
            to={isAuthenticated ? "/profile" : "/login"}
            className="home-header-icon"
            aria-label={isAuthenticated ? "Hồ sơ cá nhân" : "Đăng nhập"}
          >
            <UserRound size={22} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default React.memo(HomeHeader);
