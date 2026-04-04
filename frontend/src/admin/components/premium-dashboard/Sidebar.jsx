/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component Thanh Điều Hướng Quản Trị (Admin Premium Sidebar).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là trung tâm điều khiển (Control Center) dành riêng cho quản trị viên.
 *    - Cung cấp các lối tắt nhanh đến các phân hệ quản lý: Dashboard thổng kê, Kho hàng, Đơn hàng và Danh sách khách hàng.
 *    - Giúp Admin dễ dàng chuyển đổi qua lại giữa giao diện quản lý và giao diện mua sắm bên ngoài.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Quản trị & Vận hành Hệ thống (Admin Operations Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - `NavLink` (React Router DOM): Khác với thẻ `Link` thông thường, `NavLink` có khả năng tự nhận diện trạng thái "Active". Nếu bạn đang ở trang Dashboard, thẻ Link tương ứng sẽ tự động nhận biết để đổi màu sắc hoặc thêm viền đỏ chuyên nghiệp.
 *    - Material Symbols: Sử dụng thư viện icon thế hệ mới của Google. Các icon được gọi qua tên (ví dụ: `inventory_2`, `receipt_long`) giúp mã nguồn gọn gàng và dễ bảo trì.
 *    - Component Props: Nhận trực tiếp đối tượng `user` từ Layout cha. Kỹ thuật này giúp Sidebar luôn đồng bộ được hình ảnh và tên của Admin đang đăng nhập mà không cần gọi lại API.
 *    - Tailwind CSS Dynamic Class: Sử dụng hàm callback trong thuộc tính `className` của NavLink để xử lý logic giao diện phức tạp: "Nếu đang chọn thì hiện màu mận chín, nếu không thì hiện màu xám đá".
 *    - Fixed Sidebar Layout: Sử dụng các thuộc tính `h-screen` (chiều cao toàn màn hình) và `fixed` (cố định vị trí) để đảm bảo menu điều hướng luôn nằm bên trái, không bị trôi khi Admin cuộn các bảng dữ liệu dài.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Prop `user` chứa thông tin định danh của người quản trị.
 *    - Output: Thanh Sidebar điều hướng bên trái với hiệu ứng Premium.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `navItems`: Mảng cấu hình chứa danh sách các trang quản lý. Việc tách riêng mảng này giúp bạn dễ dàng thêm mục mới (ví dụ: "Quản lý mã giảm giá") chỉ trong 1 dòng code.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - Vòng lặp `.map()`: Duyệt qua `navItems` để sinh ra các mục menu đồng nhất.
 *    - Logic Fallback Avatar: Nếu Admin chưa có ảnh đại diện, hệ thống sẽ sử dụng một đường link ảnh mặc định để giao diện không bị trống.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Render tiêu đề Thương hiệu (ToBi Shop).
 *    - Bước 2: Tạo danh sách link quản trị chính dựa trên mảng `navItems`.
 *    - Bước 3: Render nhóm chức năng phụ (Cài đặt, Về trang chủ).
 *    - Bước 4: Hiển thị Profile Card của Admin ở chân Sidebar.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không trực tiếp gọi API. Dữ liệu `user` được truyền xuống từ `DashboardLayout`.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Conditional Styling: Đổi màu icon và chữ dựa trên trạng thái `isActive` của Router.
 *    - Phân cấp vai trò: Hiển thị nhãn "Quản lý cửa hàng" hoặc "Nhân viên" dựa vào thuộc tính `user.role`.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Màu sắc thương hiệu: Mã màu `#ee5a6f` (Hồng san hô) là màu chủ đạo cho trạng thái Active.
 *    - `z-50`: Sidebar có độ ưu tiên hiển thị cao nhất để luôn nằm trên các thành phần khác (Modals, Charts).
 */
import { NavLink } from 'react-router-dom';

const navItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/admin/dashboard' },
    { name: 'Quản lý sản phẩm', icon: 'inventory_2', path: '/admin/products' },
    { name: 'Quản lý đơn hàng', icon: 'receipt_long', path: '/admin/orders' },
    { name: 'Quản lý người dùng', icon: 'group', path: '/admin/users' },
];

export default function Sidebar({ user }) {
    return (
        <aside className="h-screen w-64 fixed left-0 top-0 border-r border-[#dfbfc0]/10 bg-[#f9f9f7] flex flex-col py-8 px-6 z-50">
            <div className="mb-12">
                <h1 className="font-headline text-2xl  font-bold text-[#ee5a6f]">ToBi Shop</h1>
            </div>
            
            <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out ${isActive ? 'font-semibold border-r-2 border-[#ee5a6f] bg-[#f4f4f2]' : 'text-stone-500 hover:text-[#ee5a6f] hover:bg-[#f4f4f2]'}`}
                    >
                        {({ isActive }) => (
                            <>
                                <span className={`material-symbols-outlined ${isActive ? 'text-[#ee5a6f]' : ''}`}>{item.icon}</span>
                                <span className={`font-label text-sm tracking-wide ${isActive ? 'text-[#ee5a6f]' : ''}`}>{item.name}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="pt-8 mt-8 border-t border-[#dfbfc0]/10 space-y-1">
                <NavLink to="/admin/settings" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out ${isActive ? 'font-semibold border-r-2 border-[#ee5a6f] bg-[#f4f4f2]' : 'text-stone-500 hover:text-[#ee5a6f] hover:bg-[#f4f4f2]'}`}>
                    {({ isActive }) => (
                        <>
                            <span className={`material-symbols-outlined ${isActive ? 'text-[#ee5a6f]' : ''}`}>settings</span>
                            <span className={`font-label text-sm tracking-wide ${isActive ? 'text-[#ee5a6f]' : ''}`}>Cài đặt</span>
                        </>
                    )}
                </NavLink>
                <NavLink to="/products" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out ${isActive ? 'font-semibold border-r-2 border-[#ee5a6f] bg-[#f4f4f2]' : 'text-stone-500 hover:text-[#ee5a6f] hover:bg-[#f4f4f2]'}`}>
                    {({ isActive }) => (
                        <>
                            <span className={`material-symbols-outlined ${isActive ? 'text-[#ee5a6f]' : ''}`}>home</span>
                            <span className={`font-label text-sm tracking-wide ${isActive ? 'text-[#ee5a6f]' : ''}`}>Về trang chủ</span>
                        </>
                    )}
                </NavLink>
            </div>

            <div className="mt-auto pt-8">
                <div className="p-4 rounded-2xl bg-[#f4f4f2] flex flex-col items-center text-center">
                    <img className="w-12 h-12 rounded-full object-cover mb-3 shadow-md" alt="Admin avatar" src={user?.avatar?.url || "https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg"} />
                    <span className="font-headline text-sm font-bold text-[#1a1c1b]">{user?.name || "Admin"}</span>
                    <span className="font-label text-[10px] text-stone-400 uppercase tracking-tighter">{(user?.role_id?.name || user?.role) === 'admin' ? "Quản lý cửa hàng" : "Nhân viên"}</span>
                </div>
            </div>
        </aside>
    );
}
