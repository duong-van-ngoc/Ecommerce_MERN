/**
 * ============================================================================
 * COMPONENT: http
 * ============================================================================
 * 1. Component là gì: 
 *    - Đảm nhiệm vai trò hiển thị và xử lý logic cho vùng phần tử `http` trong ứng dụng.
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
 *    - Sử dụng toán tử 3 ngôi (? :) hoặc `&&` để ẩn/hiện element hoặc component.
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
import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, "");
const normalizedApiUrl = rawApiUrl?.endsWith("/api/v1")
  ? rawApiUrl.slice(0, -7)
  : rawApiUrl;

axios.defaults.baseURL = normalizedApiUrl || "";
axios.defaults.withCredentials = true;
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

export default axios;
