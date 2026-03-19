/**
 * ============================================================================
 * COMPONENT: Rating (Đánh giá sao Vàng)
 * ============================================================================
 * 1. Component là gì: 
 *    - Biễu đồ trực quan Hiển thị mức Đánh giá chất lượng của khách (Stars 1-5).
 *    - Chịu trách nhiệm render icon Sao ở 2 chế độ: Interactive State (cho form) hoặc Readonly Mode (Card list).
 * 
 * 2. Props: 
 *    - `value` (number): Điểm số truyền gốc để neo.
 *    - `onRatingChange` (function): Trigger Update truyền cho Component Form mẹ. 
 *    - `disabled` (boolean): Flag chặn click lúc đang chỉ Show Card List.
 * 
 * 3. State:
 *    - Local State: 
 *      + `hoveredRating` (number): Phản ánh tức thời con trỏ chuột trên ngôi sao nào để làm sao nó sáng lên (tính năng Preview Rating) mà không ghi đè số thực.
 *      + `selectedRating` (number): Chốt vĩnh viễn mốc user bấm click chuột cuối cùng.
 * 
 * 4. Render lại khi nào:
 *    - Bất cứ khi nào chuột liếm ngang các cạnh sao (`onMouseEnter`) hoặc user thay đổi mức sao (`onClick`).
 * 
 * 5. Event handling:
 *    - `handleMouseEnter`: Lấy ID mốc sao truyền cho `setHoveredRating`.
 *    - `handleMouseLeave`: Reset sao về mức đã Fixed (`setHoveredRating(0)`).
 *    - `handleClick`: Chống sửa nếu `disabled`. Còn không thì lưu Local `selectedRating` và nổ Up `onRatingChange(rating)` lên Hook Controller form ngoài.
 * 
 * 6. Conditional rendering:
 *    - Biến cất giá trị boolean `isFilled` kiểm tra xem index sao đang vượt quá mốc chuột/Click hay bé hơn -> Bôi cam class (filled) hoặc để nhạt (empty).
 * 
 * 7. List rendering:
 *    - Vòng For thuần đẩy 5 mảng Component Element `<span>` rỗng vào Array Result `stars` và return render.
 * 
 * 8. Controlled input:
 *    - Ẩn mình dưới dạng Element Custom giả vờ là Element form input control thay vì thẻ <input> thực sự.
 * 
 * 9. Lifting state up:
 *    - Phát sự kiện thay đổi Form Select ra bên ngoài (`onRatingChange`).
 * 
 * 10. Luồng hoạt động:
 *    - Mount -> Khởi tạo 5 sao xám hoặc điểm ban đầu (vd 4 sao vàng, 1 xám).
 *    - Người dùng rê chuột lướt sao 5 -> Hover state đổi 5 -> Cả 5 sao sáng màu cam mờ. 
 *    - Click thả chuột ngay sao số 3 -> State chốt sổ 3 chấu -> Gửi 3 điểm về component Order Review.
 * ============================================================================
 */
import React, { useState } from 'react'
import '../componentStyles/Rating.css'

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