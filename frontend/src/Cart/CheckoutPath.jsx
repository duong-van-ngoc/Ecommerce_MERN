/**
 * ============================================================================
 * COMPONENT: CheckoutPath
 * ============================================================================
 * 1. Component là gì: 
 *    - Đảm nhiệm vai trò hiển thị và xử lý logic cho vùng phần tử `CheckoutPath` trong ứng dụng.
 * 
 * 2. Props: 
 *    - Nhận các props: activePath
 * 
 * 3. State:
 *    - Không sử dụng state (Stateless component).
 * 
 * 4. Render lại khi nào:
 *    - Khi Props từ cha truyền xuống thay đổi.
 * 
 * 5. Event handling:
 *    - Không có event controls phức tạp.
 * 
 * 6. Conditional rendering:
 *    - Sử dụng toán tử 3 ngôi (? :) hoặc `&&` để ẩn/hiện element hoặc component.
 * 
 * 7. List rendering:
 *    - Sử dụng `.map()` để render danh sách elements.
 * 
 * 8. Controlled input:
 *    - Không chứa form controls.
 * 
 * 9. Lifting state up:
 *    - Dữ liệu được quản lý cục bộ hoặc đẩy lên Redux store toàn cục.
 * 
 * 10. Luồng hoạt động:
 *    - (1) Component Mount -> Chỉ mount giao diện thuần và nhận Props.
 *    - (2) Nhận State/Props và render UI ban đầu.
 *    - (3) End-User tương tác trên component -> Cập nhật State -> Re-render màn hình.
 * ============================================================================
 */
import React from 'react'
import '../CartStyles/CheckoutPath.css'
import { AccountBalance, LibraryAddCheck, LocalShipping } from '@mui/icons-material'

function CheckoutPath({activePath}) {
    const path = [
        {
            label: 'Shipping Details',
            icon: <LocalShipping />
        },
        {
            label: 'Confirm Order',
            icon: <LibraryAddCheck />
        },
        {
            label: 'Payment',
            icon: <AccountBalance />
        }
    ]
  return (
     <>
     <div className="checkoutPath">
        {path.map((item, index) => (
            <div className="checkoutPath-step" key={index}
                active={activePath === index ? 'true' : 'false'}
                completed = {activePath >= index ? 'true' : 'false'}
            >
                <p className="checkoutPath-icon">{item.icon}</p>
                <p className="checkoutPath-label">{item.label}</p>
            </div>
        ))}
        
     </div>
     </>
    )
}

export default CheckoutPath