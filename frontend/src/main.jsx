/**
 * ============================================================================
 * COMPONENT: main
 * ============================================================================
 * 1. Component là gì: 
 *    - Đảm nhiệm vai trò hiển thị và xử lý logic cho vùng phần tử `main` trong ứng dụng.
 * 
 * 2. Props: 
 *    - Không nhận trực tiếp props truyền từ cha.
 * 
 * 3. State:
 *    - Không sử dụng state (Stateless component).
 * 
 * 4. Render lại khi nào:
 *    - Khi component cha re-render.
 * 
 * 5. Event handling:
 *    - Không có event controls phức tạp.
 * 
 * 6. Conditional rendering:
 *    - Render tĩnh, không có điều kiện.
 * 
 * 7. List rendering:
 *    - Không sử dụng list rendering.
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
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './global-hover.css'
import './api/http'
import App from './App.jsx'
import {Provider} from 'react-redux';
import {store} from './app/store.js';
import {ToastContainer} from 'react-toastify';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store = {store}>
    <App />
    <ToastContainer />
    </Provider>
  </StrictMode>,
)
