import http from 'k6/http';
import { check, sleep } from 'k6';

// Cấu hình Kịch bản Test Load (100 user liên tục trong 10 giây)
export const options = {
  stages: [
    { duration: '2s', target: 50 },  // Trong 2s đầu, tăng lượng truy cập lên 50 user
    { duration: '8s', target: 50 }, // Duy trì 50 user liên tục trong 8 giây tiếp theo
    { duration: '2s', target: 0 },   // Dần dần hạ xuống 0 để kết thúc mượt mà
  ],
  thresholds: {
    // Yêu cầu bắt buộc để qua bài test:
    http_req_duration: ['p(95)<500'], // 95% request phải phản hồi dưới 500ms
    http_req_failed: ['rate<0.01'],   // Tỉ lệ rớt mạng (Lỗi) phải dưới 1%
  },
};

export default function () {
  // Thay url tương ứng với API bạn muốn test, ví dụ trang chủ Load list sản phẩm
  const url = 'http://localhost:8000/api/v1/products';
  
  // Thực hiện Request GET
  const res = http.get(url);

  // Kiểm tra kết quả phản hồi có thành công (200) mạng không
  check(res, {
    'Trạng thái mạng là 200 (Thành công)': (r) => r.status === 200,
  });

  // Tạm nghỉ 1s trước khi click request tiếp theo giống 1 người dùng người thực
  sleep(1);
}
