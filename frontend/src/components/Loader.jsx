/**
 * ============================================================================
 * COMPONENT: Loader
 * ============================================================================
 * 1. Component là gì: 
 *    - Một Spinner (Vòng xoay load) hoặc dấu chân chờ (Skeleton) hoạt hoạ.
 *    - Sử dụng làm Fallback UI hiện ra chặn màn hình khi Client đang đợi fetch Data API.
 * 
 * 2. Props: 
 *    - Không nhận trực tiếp props truyền từ cha. 
 * 
 * 3. State:
 *    - Hoàn toàn Stateless.
 * 
 * 4. Render lại khi nào:
 *    - Chỉ render khi một cha hoặc Route cha (ví dụ màn hình Products) set `loading = true`. 
 *    - Unmount và biến mất khi HTTP request hoàn tất.
 * 
 * 5. Event handling:
 *    - Không dính líu đến Event của User (click chặn).
 * 
 * 6. Conditional rendering:
 *    - Không chứa Logic nội bộ, nó lệ thuộc hàm Check `if(isLoading) return <Loader />` trên component cha.
 * 
 * 7. List rendering:
 *    - Không sử dụng.
 * 
 * 8. Controlled input:
 *    - Không tồn tại.
 * 
 * 9. Lifting state up:
 *    - Mọi State điều khiển Loading đều nằm ngoài tầm kiểm soát của File này.
 * 
 * 10. Luồng hoạt động:
 *    - Mount đơn giản CSS class `loader-container` và chạy vòng xoay animation CSS tĩnh của lớp `loader`. 
 * ============================================================================
 */
import React from 'react'

import '../componentStyles/Loader.css'
function Loader() {
  return (
    <div className="loader-container">
        <div className="loader">
            
        </div>
    </div>
  )
}

export default Loader