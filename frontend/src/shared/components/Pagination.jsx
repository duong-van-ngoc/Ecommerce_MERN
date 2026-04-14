/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Thành Phần Phân Trang (Pagination Component).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Chia nhỏ danh sách sản phẩm dài thành nhiều trang để giảm tải cho trình duyệt và cải thiện tốc độ load.
 *    - Cung cấp giao diện điều hướng (Trang đầu, Trang cuối, Tiếp, Lùi và các số trang cụ thể).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Điều hướng Dữ liệu (Data Navigation Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Redux Integration (`useSelector`): Truy xuất dữ liệu `totalPages` và danh sách `products` từ Global State để quyết định có hiển thị thanh phân trang hay không.
 *    - Pagination Window Logic: Sử dụng hàm `getPageNumbers` với biến `pageWindow = 2` để chỉ hiển thị một vài số trang quanh trang hiện tại (ví dụ: [2, 3, *4*, 5, 6]). Đây là kỹ thuật tối ưu UI khi tổng số trang quá lớn (tránh tràn thanh phân trang).
 *    - Lifting State Up: Khi người dùng nhấn vào một số trang, component gọi hàm `onPageChange` (được truyền từ cha) để cha thực hiện việc fetch API mới.
 *    - Conditional Rendering: Ẩn toàn bộ component nếu chỉ có 1 trang hoặc không có sản phẩm nào.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Props điều khiển (`currentPage`, `onPageChange`) và Redux state.
 *    - Output: Thanh điều hướng trang với các nút bấm.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `currentPage`: Trang hiện tại đang xem.
 *    - `totalPages`: Tổng số trang tối đa (từ Redux).
 *    - `onPageChange`: Callback function xử lý sự kiện chuyển trang.
 * 
 * 7. CÁC HÀM / CHỨC NƠNG CHÍNH:
 *    - `getPageNumbers()`: Tính toán mảng các con số trang cần hiển thị trên giao diện theo thuật toán "cửa sổ trượt".
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Kiểm tra xem có cần phân trang không (`if(totalPages <= 1) return null`).
 *    - Bước 2: Tính toán danh sách các số trang quanh trang hiện tại.
 *    - Bước 3: Render các nút chức năng (First, Prev, Numbers, Next, Last).
 *    - Bước 4: Người dùng click -> Gọi `onPageChange(number)` -> Component cha cập nhật URL hoặc gọi API.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không trực tiếp gọi API, nhưng là tác nhân kích hoạt các request lấy dữ liệu theo trang (Pagination Request).
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Chỉ render khi có dữ liệu và số trang > 1.
 *    - Các nút Prev/Next chỉ hiện khi không ở trang đầu/cuối tương ứng.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Chú ý hàm `getPageNumbers`: Nếu muốn hiển thị nhiều số trang hơn, hãy tăng giá trị `pageWindow`.
 *    - Lưu ý sự kết hợp giữa Props (`currentPage`) và Redux (`totalPages`): Đây là mô hình kết hợp để đảm bảo component vừa linh hoạt vừa đồng bộ với ứng dụng.
 */
import React from 'react'
import '@/shared/components/styles/Pagination.css'
import { useSelector } from 'react-redux'
function Pagination({
  currentPage,
  onPageChange,
  loading = false
}) {
  const {totalPages, products} = useSelector((state) => state.product)

  if(products.length === 0 || totalPages <= 1) return null;

  // hàm tạo số trang 
  const getPageNumbers=() => {
    const pageNumbers = [];
    const pageWindow = 2;
    for(let i = Math.max(1, currentPage-pageWindow);
            i <= Math.min(totalPages, currentPage+pageWindow);
            i++
    ){
      pageNumbers.push(i)
    }
    return pageNumbers;
  }

  return (
    <div className="flex items-center gap-1.5 justify-center py-4">
        <button 
            disabled={currentPage === 1 || loading}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-2 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent transition-all"
        >
            <span className="material-symbols-outlined text-base">chevron_left</span>
        </button>
        
        {getPageNumbers().map(page => (
            <button 
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${currentPage === page ? 'bg-[#004ac6] text-white shadow-lg shadow-blue-500/30' : 'bg-white border border-slate-200 text-slate-600 hover:border-[#004ac6] hover:text-[#004ac6]'}`}
            >
                {page}
            </button>
        ))}

        <button 
            disabled={currentPage === totalPages || totalPages === 0 || loading}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-2 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent transition-all"
        >
            <span className="material-symbols-outlined text-base">chevron_right</span>
        </button>
    </div>
  )
}

export default Pagination