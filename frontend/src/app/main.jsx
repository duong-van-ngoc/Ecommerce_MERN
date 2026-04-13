/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Điểm khởi đầu của toàn bộ ứng dụng (Entry Point).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Gắn kết (Mount) ứng dụng React vào phần tử DOM có ID là 'root' trong file index.html.
 *    - Là nơi "bơm" (Inject) các dịch vụ toàn cục vào ứng dụng như Redux Store, Toast Notifications.
 *    - Khai báo các file CSS dùng chung cho toàn bộ website.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Khởi tạo (Bootstrapping Flow) - Chạy duy nhất một lần khi trang web vừa tải xong.
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - React 18 `createRoot`: API hiện đại để render ứng dụng với hiệu năng tối ưu.
 *    - Redux `<Provider>`: Cung cấp kho lưu trữ dữ liệu (Store) cho mọi Component bên trong mà không cần truyền Props thủ công.
 *    - React `StrictMode`: Chế độ nghiêm ngặt giúp phát hiện các đoạn code cũ hoặc lỗi logic tiềm ẩn trong lúc phát triển.
 *    - Global Styling: Tích hợp `index.css` và `global-hover.css` để định hình giao diện nhất quán.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Redux Store, App component, Global CSS files.
 *    - Output: Một cây DOM hoàn chỉnh được render trên trình duyệt của người dùng.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Không áp dụng cho file entry point này.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - Render Root: Khởi tạo UI.
 *    - ToastContainer: Của thư viện `react-toastify`, cho phép hiển thị các thông báo (Thành công, Lỗi, Cảnh báo) ở bất kỳ đâu trong app.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Trình duyệt tải script chính.
 *    - Bước 2: `main.jsx` thực hiện import các thư viện và cấu hình cần thiết.
 *    - Bước 3: Tạo root element và bọc ứng dụng trong `<Provider>` để kích hoạt Redux.
 *    - Bước 4: Chuyển giao quyền điều khiển luồng hiển thị cho `App.jsx`.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không trực tiếp gọi API nhưng khởi tạo `http.js` (Interceptor) để quản lý mọi request sau này.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Không có logic điều kiện ở đây, mọi thứ được render mặc định.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Đây là file nhạy cảm nhất: Một lỗi cú pháp nhỏ ở đây sẽ khiến trang web bị trắng xóa.
 *    - Nếu bạn muốn thêm một thư viện quản lý trạng thái mới (như React Query) hoặc Theme Provider, đây chính là nơi để bọc chúng vào.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/app/styles/index.css'
import '@/app/styles/global-hover.css'
import '@/shared/api/http'
import App from '@/app/App.jsx'
import {Provider} from 'react-redux';
import {store} from '@/app/store.js';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store = {store}>
    <App />
    <ToastContainer />
    </Provider>
  </StrictMode>,
)
