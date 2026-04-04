/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Định tuyến Trung gian cho Địa chỉ (Address Proxy Router).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Cung cấp dữ liệu về Tỉnh/Thành, Quận/Huyện, Phường/Xã của Việt Nam cho các form nhập địa chỉ giao hàng.
 *    - Đóng vai trò là một Proxy (Trạm trung chuyển): Backend sẽ gọi API của bên thứ ba (`provinces.open-api.vn`) rồi trả kết quả về cho Frontend.
 *    - Giải quyết vấn đề CORS: Tránh việc Frontend bị trình duyệt chặn khi gọi trực tiếp sang domain khác.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Thông tin khách hàng (User Info) & Luồng Thanh toán/Giao hàng (Checkout/Shipping).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Proxy Pattern: Backend làm trung gian gọi tài nguyên bên ngoài.
 *    - Fetch API (Node.js): Sử dụng hàm `fetch` để thực hiện yêu cầu HTTP bất đồng bộ từ server-to-server.
 *    - Express Router: Định nghĩa các endpoint tìm kiếm và truy vấn theo mã hành chính.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Mã vùng (`code`), từ khóa tìm kiếm (`q`) hoặc độ sâu thông tin (`depth`) từ Frontend.
 *    - Output: Dữ liệu JSON chứa danh sách tỉnh, huyện, xã tương ứng.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `API_URL`: Địa chỉ gốc của Open API Tỉnh thành Việt Nam.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `proxyFetch`: Hàm tiện ích để thực hiện gọi API bên ngoài, xử lý lỗi hệ thống và trả về kết quả chuẩn hóa cho client.
 *    - Nhóm Search: Tìm kiếm đơn vị hành chính theo tên.
 *    - Nhóm Query: Lấy danh sách con dựa trên mã code của đơn vị cha (vd: lấy các huyện của tỉnh Hà Nội).
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Frontend gửi yêu cầu lấy danh sách tỉnh.
 *    - Bước 2: Backend tiếp nhận yêu cầu, dùng `proxyFetch` để chuyển tiếp yêu cầu sang API của bên thứ ba.
 *    - Bước 3: Đợi phản hồi từ API ngoài, nếu thành công thì trả dữ liệu về Frontend, nếu lỗi thì báo lỗi 500.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Frontend -> Backend API -> External API -> Backend API -> Frontend. (Không tương tác với Database nội bộ).
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Kiểm tra `response.ok` để đảm bảo API bên thứ ba đang hoạt động bình thường. 
 *    - Các route này là công khai (Public) để mọi người dùng đều có thể nhập địa chỉ.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Sử dụng `async/await` cực kỳ quan trọng vì việc gọi API bên ngoài luôn có độ trễ mạng (Network Latency).
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Thứ tự Route: Các đường dẫn cụ thể như `/p/search` được đặt **TRÊN** các đường dẫn có tham số như `/p/:code`. Nếu đảo ngược, Express sẽ coi từ "search" là giá trị của `:code`.
 *    - Vì file này phụ thuộc vào API bên thứ ba, nếu trang `provinces.open-api.vn` sập, tính năng chọn địa chỉ trên web cũng sẽ bị ảnh hưởng.
 */
import express from "express";

const router = express.Router();

const API_URL = "https://provinces.open-api.vn/api/v1";

// Helper function to handle fetch
const proxyFetch = async (url, res, transform = (data) => data) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
        return res.status(response.status).json({ success: false, message: `API Error: ${response.status}` });
    }
    const data = await response.json();
    res.status(200).json(transform(data));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- ROUTES SEARCH (Đặt trên các route tham số để tránh xung đột) ---
router.get("/p/search", (req, res) => {
  const { q } = req.query;
  proxyFetch(`${API_URL}/p/search/?q=${q}`, res);
});

router.get("/d/search", (req, res) => {
  const { q } = req.query;
  proxyFetch(`${API_URL}/d/search/?q=${q}`, res);
});

router.get("/w/search", (req, res) => {
  const { q } = req.query;
  proxyFetch(`${API_URL}/w/search/?q=${q}`, res);
});

// --- ROUTES CHÍNH ---

// Lấy danh sách tỉnh/thành (/p hoặc /p/)
router.get("/p", (req, res) => {
  proxyFetch(`${API_URL}/p/`, res);
});

// Lấy danh sách quận/huyện theo tỉnh (/p/:code)
router.get("/p/:code", (req, res) => {
  const { code } = req.params;
  const depth = req.query.depth || 1;
  proxyFetch(`${API_URL}/p/${code}?depth=${depth}`, res);
});

// Lấy danh sách phường/xã theo huyện (/d/:code)
router.get("/d/:code", (req, res) => {
  const { code } = req.params;
  const depth = req.query.depth || 1;
  proxyFetch(`${API_URL}/d/${code}?depth=${depth}`, res);
});

export default router;
