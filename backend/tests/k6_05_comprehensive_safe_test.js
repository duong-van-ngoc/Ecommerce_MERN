import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000/api/v1';

export const options = {
  // Bài Test "Tương tác Toàn diện": 50 Users 
  stages: [
    { duration: '30s', target: 50 },  // Đẩy  lên 50 Users
    { duration: '1m', target: 50 }, 
    { duration: '20s', target: 0 },   // Thoát
  ],
};

export default function () {
  // GHI CHÚ: K6 tự động nhớ Cookie "token" sau khi Login thành công, 
  

  // 1. NGƯỜI DÙNG ĐĂNG NHẬP (Chịu tải thuật toán mã hoá)
  const loginRes = http.post(`${BASE_URL}/login`, JSON.stringify({ email: 'dvn150903@gmail.com', password: '12345678' }), { headers: { 'Content-Type': 'application/json' } });
  check(loginRes, { '1. POST /login (Success)': (r) => r.status === 200 });
  sleep(0.5);

  // 2. VÀO TRANG CÁ NHÂN (Xác thực Cookie JWT)
  const profileRes = http.get(`${BASE_URL}/profile`);
  check(profileRes, { '2. GET /profile (Success)': (r) => r.status === 200 });
  sleep(0.5);

  // 3. VỀ TRANG CHỦ XEM HÀNG (Truy vấn CSDL nặng & Phân trang)
  const productsRes = http.get(`${BASE_URL}/products?page=1&limit=12`);
  check(productsRes, { '3. GET /products (Success)': (r) => r.status === 200 });
  sleep(0.5);

  // 4. XEM GIỎ HÀNG (Tra cứu thông tin cá nhân)
  const cartRes = http.get(`${BASE_URL}/cart/`);
  check(cartRes, { '4. GET /cart (Success)': (r) => r.status === 200 });
  sleep(0.5);

  // 5. THEO DÕI ĐƠN HÀNG (Khớp lệnh Database)
  const ordersRes = http.get(`${BASE_URL}/orders/user`);
  check(ordersRes, { '5. GET /orders (Success)': (r) => r.status === 200 });
  sleep(0.5);

  // 6. CHỌN ĐỊA CHỈ NHẬN HÀNG (Quét các Tỉnh Thành phố)
  const addressRes = http.get(`${BASE_URL}/p`);
  check(addressRes, { '6. GET /address_provinces (Success)': (r) => r.status === 200 });
  sleep(0.5);

  // 7. QUA HỎI TOBI AI (Giao tiếp với Gemini API)
  const aiPayload = JSON.stringify({ message: "Phốc sóc thì nên ăn hạt hạt vừng hay royal canin?" });
  const aiRes = http.post(`${BASE_URL}/chat`, aiPayload, { headers: { 'Content-Type': 'application/json' } });
  check(aiRes, { '7. POST /chat_ai (Success)': (r) => r.status === 200 });
  sleep(1);
}
