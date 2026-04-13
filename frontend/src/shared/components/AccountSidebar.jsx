/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component Thanh Điều Hướng Cá Nhân (Account Sidebar).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là menu điều hướng phụ, chỉ xuất hiện khi người dùng truy cập vào khu vực Quản lý tài khoản.
 *    - Giúp người dùng chuyển đổi nhanh giữa các trang: Hồ sơ cá nhân, Lịch sử mua hàng, Thông báo và Kho Voucher.
 *    - Tăng tính thẩm mỹ với Profile Card thu nhỏ (Avatar + Tên) ở ngay đầu menu.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Quản lý Tài khoản & Hồ sơ (User Profile & Account Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - `useLocation` from React Router: Dùng để lấy địa chỉ URL hiện tại. Kỹ thuật này giúp Sidebar luôn biết mình đang ở đâu để tự động "thắp sáng" (active) mục menu tương ứng.
 *    - Redux State Integration: Lấy thông tin `user` toàn cục để hiển thị ảnh đại diện và tên thật của người dùng ngay trên Sidebar, tạo cảm giác cá nhân hóa cao.
 *    - Dynamic Avatar Fallback: Logic thông minh cho ảnh đại diện. Nếu người dùng đã upload ảnh (có `avatar.url`), hệ thống sẽ hiện ảnh đó. Nếu chưa, nó sẽ lấy chữ cái đầu của tên (ví dụ: "D" cho "Dương") để tạo ra một Avatar giả lập đẹp mắt.
 *    - Nested List Rendering (Sub-menus): Kỹ thuật render menu đa cấp. Mảng `menuItems` có thể chứa các món con (`subItems`), giúp tổ chức các tính năng phức tạp (như mục Thông báo) một cách gọn gàng.
 *    - CSS Active Class Logic: Sử dụng hàm `isActive` để gán class CSS đặc biệt cho Link, giúp người dùng luôn định vị được mình đang ở mục nào.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Thông tin User từ Redux và đường dẫn URL từ trình duyệt.
 *    - Output: Sidebar Menu có khả năng tương tác và điều hướng.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Không sử dụng Local State, hoàn toàn phụ thuộc vào URL và Global State.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `isActive`: Kiểm tra xem đường dẫn truyền vào có trùng với trang hiện tại không.
 *    - Logic Render lồng nhau: Duyệt qua danh sách menu chính và các danh sách con (`subItems`) nếu có.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Component mount vào một phía của trang cá nhân.
 *    - Bước 2: Hiển thị Avatar và tên User từ Redux.
 *    - Bước 3: Duyệt mảng `menuItems` và render ra các thẻ Link.
 *    - Bước 4: Kiểm tra URL, nếu khớp với trang nào thì mục đó sẽ nổi bật lên (highlight).
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không có. Tuy nhiên, thông tin User hiển thị ở đây được đồng bộ từ MongoDB thông qua quá trình Đăng nhập/Cập nhật trước đó.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Conditional Avatar: Quyết định hiện ảnh hay hiện chữ placeholder.
 *    - Sub-menu Visibility: Các menu con trong mục Thông báo sẽ tự động "bung ra" (`expanded`) nếu người dùng đang ở một trong các trang con đó.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Mảng `menuItems`: Đây là nơi bạn định nghĩa toàn bộ cấu trúc Sidebar. Nếu muốn thêm chức năng mới (ví dụ: "Danh sách địa chỉ"), hãy thêm một đối tượng mới vào mảng này.
 *    - `user?.name?.charAt(0)`: Chú ý dấu `?.` (Optional Chaining) để tránh lỗi ứng dụng bị "văng" nếu dữ liệu User chưa kịp load về.
 */
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import "@/shared/components/styles/AccountSidebar.css";

function AccountSidebar() {
    const location = useLocation();
    const { user } = useSelector((state) => state.user);

    const isActive = (path) => location.pathname === path;

    const menuItems = [
        {
            icon: "👤",
            label: "Tài Khoản Của Tôi",
            path: "/profile",
        },
        {
            icon: "📦",
            label: "Đơn Mua",
            path: "/orders/user",
        },
        {
            icon: "🔔",
            label: "Thông Báo",
            path: "/notifications",
            subItems: [
                { label: "Cập Nhật Đơn Hàng", path: "/notifications/order" },
                { label: "Khuyến Mãi", path: "/notifications/promotion" },
                // { label: "Cập Nhật Ví", path: "/notifications/wallet" },
                // { label: "Cập Nhật Shopee", path: "/notifications/shopee" },
            ]
        },
        {
            icon: "🎟️",
            label: "Kho Voucher",
            path: "/vouchers",
        },
    ];

    return (
        <div className="account-sidebar">
            {/* User Info */}
            <div className="sidebar-user">
                <div className="user-avatar">
                    {user?.avatar?.url ? (
                        <img src={user.avatar.url} alt={user.name} />
                    ) : (
                        <div className="avatar-placeholder">
                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                    )}
                </div>
                <div className="user-info">
                    <div className="user-name">{user?.name || "Tài khoản"}</div>
                    <Link to="/profile/update" className="edit-profile">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Sửa Hồ Sơ
                    </Link>
                </div>
            </div>

            {/* Menu Items */}
            <nav className="sidebar-menu">
                {menuItems.map((item) => {
                    // Check if any subItem is active
                    const isParentActive = isActive(item.path) || (item.subItems && item.subItems.some(sub => isActive(sub.path)));

                    return (
                        <div key={item.path} className="menu-group">
                            <Link
                                to={item.path}
                                className={`menu-item ${isActive(item.path) ? "active" : ""}`}
                            >
                                <span className="menu-icon">{item.icon}</span>
                                <span className="menu-label">{item.label}</span>
                            </Link>

                            {/* Render Submenu if exists */}
                            {item.subItems && (
                                <div className={`sub-menu ${isParentActive ? "expanded" : ""}`}>
                                    {item.subItems.map(subItem => (
                                        <Link
                                            key={subItem.path}
                                            to={subItem.path}
                                            className={`sub-menu-item ${isActive(subItem.path) ? "active" : ""}`}
                                        >
                                            {subItem.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </div>
    );
}

export default AccountSidebar;
