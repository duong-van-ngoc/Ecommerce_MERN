import React, { useEffect } from "react";
import { Bell, Search, ShoppingCart, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useHomeSearch from "@/features/home/hooks/useHomeSearch";
import { fetchNotifications } from "@/features/notifications/notificationSlice";
import BrandLogo from "@/shared/components/BrandLogo";

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
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-slate-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4 sm:gap-8">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex-shrink-0 flex items-center group" 
            aria-label="Trang chủ ToBi Shop"
          >
            <BrandLogo to={null} size="lg" className="transition-transform group-hover:scale-[1.03]" />
          </Link>

          {/* Search Bar */}
          <form 
            className="flex-1 max-w-xl relative hidden sm:block" 
            onSubmit={handleSearchSubmit}
          >
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors">
                <Search size={18} />
              </span>
              <input
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Tìm kiếm sản phẩm yêu thích..."
                className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-11 pr-4 focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all duration-300 text-sm"
                aria-label="Tìm kiếm sản phẩm"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Mobile Search Icon - Only visible on small screens */}
            <button className="sm:hidden p-2 text-text-secondary hover:text-primary transition-colors">
              <Search size={22} />
            </button>

            <Link
              to={isAuthenticated ? "/notifications" : "/login"}
              className="p-2 text-text-secondary hover:text-primary relative group transition-colors"
              aria-label="Thông báo"
            >
              <Bell size={22} className="group-hover:rotate-12 transition-transform" />
              {isAuthenticated && unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-accent text-white text-[10px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 border-2 border-surface">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            <Link 
              to="/cart" 
              className="p-2 text-text-secondary hover:text-primary relative group transition-colors" 
              aria-label="Giỏ hàng"
            >
              <ShoppingCart size={22} className="group-hover:-translate-y-0.5 transition-transform" />
              {cartItems.length > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-primary text-white text-[10px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 border-2 border-surface">
                  {cartItems.length > 99 ? "99+" : cartItems.length}
                </span>
              )}
            </Link>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            {/* <Link
              to={isAuthenticated ? "/profile" : "/login"}
              className="flex items-center gap-2 p-1.5 sm:p-2 text-text-secondary hover:text-primary transition-colors group"
              aria-label={isAuthenticated ? "Hồ sơ cá nhân" : "Đăng nhập"}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-accent/10 group-hover:text-accent transition-all">
                <UserRound size={20} />
              </div>
              <span className="text-sm font-semibold hidden md:block">
                {isAuthenticated ? "Tài khoản" : "Đăng nhập"}
              </span>
            </Link> */}
          </div>
        </div>
      </div>
    </header>
  );
}

export default React.memo(HomeHeader);
