/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Thành Phần Thông Báo Không Tìm Thấy Sản Phẩm (No Products Empty State).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Hiển thị phản hồi khi một danh mục không có sản phẩm hoặc kết quả tìm kiếm/lọc trống rỗng.
 *    - Cung cấp các chỉ dẫn rõ ràng cho người dùng (Thử từ khóa khác, quay lại sau) thay vì để màn hình trắng.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Xử lý Trạng thái Ngoại lệ (Edge Case / Empty State Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Ternary Operator Logic: Sử dụng `keyword ? A : B` để thay đổi thông điệp linh hoạt tùy theo ngữ cảnh (Tìm kiếm hay Lọc danh mục).
 *    - Content Personalization: Nhúng trực tiếp giá trị `keyword` vào trong chuỗi thông báo để người dùng biết chính xác từ khóa nào đang không có kết quả.
 *    - Presentational Component: Đây là một component "câm" (Dumb Component), chỉ nhận dữ liệu và hiển thị, không chứa logic nghiệp vụ phức tạp.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Prop `keyword` (Từ khóa tìm kiếm).
 *    - Output: Giao diện thông báo lỗi/trống kèm icon cảnh báo.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `keyword`: Được truyền từ component cha (thành phần quản lý danh sách sản phẩm).
 * 
 * 7. CÁC HÀM / CHỨC NƠNG CHÍNH:
 *    - Render thông điệp tùy biến dựa trên `keyword`.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Component cha thực hiện lọc/tìm kiếm và trả về mảng rỗng.
 *    - Bước 2: Component cha gọi `<NoProducts keyword={...} />`.
 *    - Bước 3: Component này kiểm tra sự tồn tại của keyword và render câu thông báo phù hợp.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không gọi API.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Hiển thị theo logic rẽ nhánh văn bản dựa trên tham số đầu vào.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Icon `⚠`: Đây là ký tự đặc biệt, nếu muốn đổi sang Icon chuyên nghiệp hơn có thể dùng thư viện `@mui/icons-material`.
 *    - Luôn đảm bảo rằng component cha đã lọc dữ liệu xong trước khi hiển thị khối này để tránh việc nó hiện lên rồi biến mất (Flicker) khi dữ liệu đang load.
 */
import React from 'react'
import '../componentStyles/NoProducts.css'

function NoProducts({ keyword }) {
  return (
    <div className="no-products-content">
        <div className="no-products-icon">⚠</div>
        <h3 className="no-products-title">Không tìm thấy sản phẩm</h3>
        <p className="no-products-message">
            {/* Bây giờ biến keyword đã có dữ liệu, logic này sẽ chạy đúng */}
            {keyword
              ? `Chúng tôi không tìm thấy sản phẩm nào cho "${keyword}". Hãy thử tìm từ khóa khác.`
              : `Hiện tại danh mục này chưa có sản phẩm. Vui lòng quay lại sau.`
            }
        </p>
        
    </div>
  )
}

export default NoProducts