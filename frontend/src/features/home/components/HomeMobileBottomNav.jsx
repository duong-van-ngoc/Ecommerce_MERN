import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingBag, UserRound } from "lucide-react";
import { useSelector } from "react-redux";

function HomeMobileBottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.user);
  const { cartItems = [] } = useSelector((state) => state.cart);

  const items = useMemo(
    () => [
      { label: "Trang chủ", to: "/", icon: Home },
      { label: "Mua sắm", to: "/products", icon: Search },
      { label: "Giỏ hàng", to: "/cart", icon: ShoppingBag, badge: cartItems.length },
      { label: "Tài khoản", to: isAuthenticated ? "/profile" : "/login", icon: UserRound },
    ],
    [cartItems.length, isAuthenticated]
  );

  return (
    <nav className="home-mobile-bottom-nav" aria-label="Điều hướng nhanh trên di động">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);

        return (
          <Link key={item.label} to={item.to} className={isActive ? "active" : ""}>
            <span className="home-mobile-nav-icon">
              <Icon size={22} aria-hidden="true" />
              {item.badge > 0 && <b>{item.badge > 99 ? "99+" : item.badge}</b>}
            </span>
            <small>{item.label}</small>
          </Link>
        );
      })}
    </nav>
  );
}

export default React.memo(HomeMobileBottomNav);
