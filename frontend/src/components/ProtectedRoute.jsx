/**
 * ============================================================================
 * COMPONENT: ProtectedRoute (Security Wrapper)
 * ============================================================================
 * 1. Component là gì: 
 *    - Higher-Order Component Wrapper chịu trách nhiệm che chắn 1 component màn hình
 *    bí mật cần uỷ quyền riêng tư (Shopping Cart, Checkout, User Settings).
 *    - Hoạt động giống Gate-Keeper (Bảo vệ giữ cửa).
 * 
 * 2. Props: 
 *    - `element` (JSX): Nội dung cục ruột Component đích mà Router muốn gọi nhưng đang khoá bằng wrapper này.
 * 
 * 3. State:
 *    - Global State: Móc thẳng vào Cookie/Session Redux state của `user` với hai flag `isAuthenticated` và `loading`.
 * 
 * 4. Render lại khi nào:
 *    - Quá trình đăng nhập/đăng xuất hoàn tất đẩy tín hiệu vào Global Redux Store. Mạng nhện sẽ kích Re-render file này ngầm.
 * 
 * 5. Event handling:
 *    - Lắng nghe thụ động.
 * 
 * 6. Conditional rendering:
 *    - Điều kiện 1: Tình trạng tải của API check JWT. `if (loading)` -> Phóng Component `<Loader/>` chặn mặt UI, không cho ai xem hay click.
 *    - Điều kiện 2: Kiểm tra thẻ vào. `if(!isAuthenticated)` (Guest trần) -> Cấm ném Component ra, Redirect thẻ văng về `<Navigate to="/login" />`.
 *    - Điều kiện 3 (Mặc định): JWT Token Auth hợp lệ hoàn toàn -> Cho pass cửa, return mã JSX HTML của file con.
 * 
 * 7. List rendering:
 *    - Không.
 * 
 * 8. Controlled input:
 *    - Không.
 * 
 * 9. Lifting state up:
 *    - Không.
 * 
 * 10. Luồng hoạt động:
 *    - Bất kì lúc nào User Click 1 link nhảy sang page `Checkout`: 
 *      + Tuyến ngoài cùng App.jsx quăng Component Checkout nhét vào bụng `<ProtectedRoute element={<Checkout />}>`.
 *      + ProtectedRoute bung khiên ra tra khảo Store -> Fail? Redirect ép Login. Pass -> Component Check Out mount thành công 100%.
 * ============================================================================
 */
import React from 'react'

import {useSelector} from 'react-redux'
import Loader from '../components/Loader'
import {Navigate} from 'react-router-dom'


function ProtectedRoute({element}) {

  const {isAuthenticated, loading} = useSelector(state => state.user)

  if(loading) {
    return <Loader/>
  }
  if(!isAuthenticated) {
    return <Navigate to ="/login" />

  }
  return element
}

export default ProtectedRoute