/**
 * ============================================================================
 * COMPONENT: NoProducts (Empty State)
 * ============================================================================
 * 1. Component là gì: 
 *    - Layout cảnh báo trạng thái rỗng (Empty State/ 404 block) hiển thị cho người dùng biết 
 *      Query Search, Filter Range Giá hoặc Category hiện tại không khớp với bất kỳ List hàng nào.
 * 
 * 2. Props: 
 *    - `keyword` (string): Text từ khoá User đã search trên ô Input để hiện vào câu văn.
 * 
 * 3. State:
 *    - Không có State nội bộ. Component thuần chức năng Presentational.
 * 
 * 4. Render lại khi nào:
 *    - Component cha là trang `/products` đánh giá mảng `products.length === 0` thì kích hoạt khối này.
 *    - Render lại khi giá trị `keyword` từ URL nhảy sang một từ khác.
 * 
 * 5. Event handling:
 *    - Không bắt Event, chỉ in ra text và Icon tam giác ⚠ cảnh báo.
 * 
 * 6. Conditional rendering:
 *    - Inline condition check `keyword ? A : B`. Nếu URL có tham số keyword thì báo "Không tìm thấy cho (word)", Nếu trống (nhấn vào Menu mảng rỗng) thì báo "Danh mục hiện chưa có sản phẩm".
 * 
 * 7. List rendering:
 *    - Không sử dụng.
 * 
 * 8. Controlled input:
 *    - Không sử dụng.
 * 
 * 9. Lifting state up:
 *    - Hoàn toàn nhận dữ liệu 1 chiều (One-way prop).
 * 
 * 10. Luồng hoạt động:
 *    - Lấy prop `keyword`. In ra màn hình icon Warning + Text động tương thích với ngữ cảnh tìm kiếm từ khoá hay ngữ cảnh click Filter Category.
 * ============================================================================
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