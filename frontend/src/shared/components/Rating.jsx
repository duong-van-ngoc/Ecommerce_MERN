/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component Rating (Hệ thống Đánh giá 5 Sao).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Cung cấp một phương thức trực quan để người dùng đánh giá chất lượng sản phẩm.
 *    - Xuất hiện linh hoạt ở hai nơi: Trên thẻ sản phẩm (chế độ chỉ xem) và trong form đánh giá (chế độ tương tác).
 *    - Giúp hệ thống thu thập điểm số từ 1 đến 5 sao để tính toán trung bình cộng cho sản phẩm.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Phản hồi Người dùng & Uy tín Sản phẩm (User Feedback & Product Reputation Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Multi-state Interaction Logic: Sử dụng đồng thời hai trạng thái `hoveredRating` (cho hiệu ứng preview khi rê chuột) và `selectedRating` (cho kết quả chốt cuối cùng). Việc tách đôi giúp trải nghiệm người dùng cực kỳ mượt mà.
 *    - Lifting State Up: Một kỹ thuật React kinh điển. Khi người dùng click chọn số sao, Component con này sẽ "đẩy" giá trị đó lên cho Component cha (như trang Đánh giá) thông qua hàm callback `onRatingChange`.
 *    - Dynamic Element Generation: Sử dụng vòng lặp `for` để tự động sinh ra đúng 5 ngôi sao. Cách tiếp cận này chuyên nghiệp hơn nhiều so với việc viết tay 5 thẻ `<span>` tĩnh, giúp bạn dễ dàng thay đổi lên hệ thống 10 sao nếu cần.
 *    - Conditional Styling (Filled vs Empty): Logic tính toán thông minh: "Nếu số sao thứ i nhỏ hơn hoặc bằng số sao đang chọn, thì cho nó màu vàng, ngược lại màu xám".
 *    - Pointer Events Control: Sử dụng thuộc tính CSS `pointer-events: none` khi `disabled=true`. Đây là cách đơn giản và hiệu quả nhất để biến một Control tương tác thành một nhãn hiển thị tĩnh mà không làm loãng logic code.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Điểm số khởi tạo (`value`), cờ hiệu khóa tương tác (`disabled`) và hàm nhận kết quả (`onRatingChange`).
 *    - Output: Một dãy ngôi sao có khả năng "thắp sáng" theo tương tác chuột.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `hoveredRating`: Lưu mốc sao mà chuột đang lướt qua (dùng cho hiệu ứng sáng mờ).
 *    - `selectedRating`: Lưu mốc điểm mà người dùng đã chính thức nhấn chọn.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `generateStars`: Hàm "kiến trúc sư" tổng hợp logic trạng thái để xây dựng nên dãy sao.
 *    - Event Handlers: Bộ ba `MouseEnter`, `MouseLeave`, `Click` điều khiển toàn bộ trải nghiệm người dùng.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Khởi tạo mức sao dựa trên Prop `value`.
 *    - Bước 2: User rê chuột qua sao số 4 -> `hoveredRating` thành 4 -> 4 sao đầu tiên sáng vàng.
 *    - Bước 3: User click vào sao số 4 -> `selectedRating` thành 4 -> Gửi số 4 lên cho cha xử lý.
 *    - Bước 4: User bỏ chuột ra -> `hoveredRating` về 0 -> Dãy sao quay về trạng thái đã chọn ở Bước 3.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không gọi API trực tiếp. Kết quả được đẩy lên cha để cha thực hiện POST request lưu vào MongoDB.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Guard Clause: `if(!disabled)` lọc toàn bộ các tương tác chuột, đảm bảo không ai có thể sửa điểm đánh giá trên thẻ sản phẩm ở trang chủ.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Ký tự `★`: Đây là ký tự Unicode đặc biệt. Nếu bạn muốn dùng Icon xịn hơn (như SVG hay FontAwesome), chỉ cần thay thế ký tự này trong hàm `generateStars`.
 *    - Logic `i <= (hoveredRating || selectedRating)`: Đây là "trái tim" của hiệu ứng sáng sao, ưu tiên hiển thị mốc đang rê chuột trước mốc đã chọn.
 */
import React, { useState } from 'react'
import '@/shared/components/styles/Rating.css'

function Rating({value,onRatingChange, disabled }) {
    
    const [hoveredRating, setHoveredRating] = useState(0)

    const [selectedRating, setSelectedRating] = useState(value || 0) 
    
    {/*xử lý di chuột vào một ngôi sao */}

    const handleMouseEnter = (rating) => {
        if(!disabled) {
            setHoveredRating(rating)
        }
    }

    // ko hover
    const handleMouseLeave=() => {
        if(!disabled) {
            setHoveredRating(0)
        }
    }

    // xử lý nhấn chuột 
    const handleClick  = (rating) => {
        if(!disabled) {
            setSelectedRating(rating)
            if(onRatingChange)  {
                onRatingChange(rating) 
            }
        }
    }
    // Tạo các sao đánh giá dựa trên các lượt đáng giá đã chọn 
   const generateStars = () => {
    const stars =[]
    for(let i = 1; i <= 5 ;i++) {
        const isFilled = i <= (hoveredRating || selectedRating)
        stars.push(
            <span className={`star ${isFilled? 'filled' : 'empty'}`}
            onMouseEnter={() => handleMouseEnter(i)}
            onMouseLeave={() => handleMouseLeave()}
            onClick={() => handleClick(i)}
            style = {{pointerEvents : disabled?'none':'auto'}}
            key={i}
            >★</span>
        )
    }
    return stars
   } 
  return (
    <div className="rating">{generateStars()}</div>
  )

}

export default Rating