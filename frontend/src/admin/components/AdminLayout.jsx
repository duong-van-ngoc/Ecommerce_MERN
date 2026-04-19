/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component Bố Cục Quản Trị (Admin Layout Wrapper).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Đóng vai trò là "chốt chặn bảo mật" cuối cùng cho khu vực Admin.
 *    - Xác thực xem người dùng đã đăng nhập chưa và có đúng là Quản trị viên (Admin) hay không.
 *    - Tạo ra khung giao diện đồng nhất (gồm Sidebar và vùng nội dung chính) cho tất cả các trang quản lý.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Phân Quyền & Bố Cục Quản Trị (Admin RBAC & Layout Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - `Outlet` from React Router DOM: Một "lỗ hổng" thông minh trong Layout. Bất kỳ trang nào (Dashboard, Quản lý sản phẩm,...) được định nghĩa là con của AdminLayout trong Route sẽ được "đổ" dữ liệu vào đúng vị trí của thẻ `<Outlet />` này.
 *    - Role-Based Access Control (RBAC): Kỹ thuật kiểm tra quyền dựa trên vai trò. Ở đây ta kiểm tra thuộc tính `user.role`. Nếu không phải 'admin', người dùng sẽ bị "tống cổ" ra trang chủ ngay lập tức.
 *    - Declarative Redirect: Sử dụng `<Navigate to="..." replace />` để chuyển hướng. Thuộc tính `replace` giúp ghi đè lên lịch sử trình duyệt, ngăn người dùng bấm nút "Quay lại" để cố vào lại trang cấm.
 *    - Redux Global State: Lấy thông tin xác thực từ Store. Đây là cách nhanh nhất để kiểm tra quyền mà không cần đợi API phản hồi lại từ Database.
 *    - Integration with Premium UI: Nhúng toàn bộ nội dung vào `DashboardLayout` (một thành phần UI cao cấp) để đảm bảo giao diện Admin trông chuyên nghiệp và sang trọng.
 *
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Trạng thái đăng nhập từ Redux và yêu cầu truy cập từ Router.
 *    - Output: Khung Dashboard hoàn chỉnh hoặc lệnh chuyển hướng (Redirect).
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `isAuthenticated`: Cờ xác nhận đã đăng nhập.
 *    - `user`: Đối tượng chứa thông tin vai trò (`role`).
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - Logic kiểm soát truy cập (Access Control Logic).
 *    - Wrapper hiển thị Layout cao cấp (`DashboardLayout`).
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Người dùng gõ `/admin/dashboard`.
 *    - Bước 2: `AdminLayout` được gọi đầu tiên.
 *    - Bước 3: Kiểm tra `isAuthenticated`. Nếu chưa đăng nhập -> Văng về `/login`.
 *    - Bước 4: Kiểm tra `user.role`. Nếu không phải 'admin' -> Báo lỗi "Không có quyền" -> Văng về trang chủ `/`.
 *    - Bước 5: Nếu pass cả 2 bước -> Hiển thị Sidebar, Menu và chèn trang Dashboard vào vùng `Outlet`.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không gọi API trực tiếp. Tuy nhiên, nó sử dụng thông tin từ API đăng nhập đã lưu vào Redux.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Phân quyền cứng (Hard Authorization): Chỉ 'admin' mới được qua cửa.
 *    - Thông báo lỗi: Sử dụng `toast.error` để thông báo rõ ràng lý do bị từ chối truy cập.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Đây là "Trạm gác" của khu vực Admin. Mọi thay đổi về phân quyền trong tương lai (ví dụ: thêm quyền 'staff', 'manager') đều phải bắt đầu sửa từ file này.
 *    - `DashboardLayout` là nơi chứa CSS và cấu trúc Sidebar, nếu muốn đổi màu Sidebar, hãy tìm vào file đó.
 */
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// Import New Premium Layout
import DashboardLayout from '@/admin/components/premium-dashboard/DashboardLayout';

function AdminLayout() {
    const { isAuthenticated, user } = useSelector(state => state.user);

    // Kiểm tra quyền truy cập
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Kiểm tra quyền: sử dụng schema mới (role_id.name)
    const userRole = user?.role_id?.name || user?.role;
    if (userRole !== 'admin') {
        toast.error('Bạn không có quyền truy cập trang này');
        return <Navigate to="/" replace />;
    }

    return (
        <DashboardLayout user={user}>
            <Outlet />
        </DashboardLayout>
    );
}

export default AdminLayout;
 