/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Thành Phần Quản Lý Tiêu Đề Trang (Dynamic Page Title Manager).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Cập nhật tiêu đề trên thanh Tab của trình duyệt (`document.title`) theo từng trang cụ thể.
 *    - Cải thiện trải nghiệm người dùng (giúp họ biết mình đang ở trang nào khi mở nhiều tab).
 *    - Hỗ trợ SEO cơ bản bằng cách thay đổi tiêu đề động phù hợp với nội dung trang.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Tương tác Hệ thống & SEO (System & SEO Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Side Effects (`useEffect`): Sử dụng Hook này để thực hiện một tác vụ "bên lề" (Side Effect) là can thiệp vào DOM ngoài tầm kiểm soát của React (thẻ `<title>` trong `<head>`).
 *    - Dependency Array: Truyền `[title]` vào mảng phụ thuộc để đảm bảo hàm chỉ chạy lại khi giá trị tiêu đề thay đổi, tránh lãng phí tài nguyên.
 *    - React Fragment: Trả về `<></>` vì component này không cần hiển thị bất kỳ giao diện nào trên màn hình (Non-visual Component).
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Prop `title` (Chuỗi văn bản tiêu đề).
 *    - Output: Cập nhật `document.title` của trình duyệt.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `title`: Tiêu đề mong muốn (ví dụ: "Giỏ hàng | Shop MERN").
 * 
 * 7. CÁC HÀM / CHỨC NƠNG CHÍNH:
 *    - Lắng nghe thay đổi của prop và cập nhật tiêu đề hệ thống.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Component được mount vào một trang (ví dụ trang Login).
 *    - Bước 2: `useEffect` được kích hoạt.
 *    - Bước 3: Lệnh `document.title = title` ghi đè tiêu đề cũ của trình duyệt.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không liên quan.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Luôn chạy khi được gọi.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Việc cập nhật DOM của trình duyệt là một thao tác đồng bộ nhưng được quản lý trong vòng đời bất đồng bộ của React.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Đây là một Component Tiện ích (Utility Component) cực kỳ hữu ích trong các ứng dụng Single Page Application (SPA) để đánh lừa cảm giác của người dùng như đang chuyển giữa các trang web truyền thống.
 */
import React, {useEffect}from 'react'

function PageTitle({title}) {
    useEffect(() => {
        document.title = title
    }
    , [title])
    return (
    <>
    </>
    )
}

export default PageTitle