import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000/api/v1';

export const options = {
  // Spike Test: Thử thách đột biến (VD: Làn sóng Săn Sale lúc 0h00)
  stages: [
    { duration: '10s', target: 10 },  
    { duration: '5s', target: 300 },   // 5 Giây tăng vọt lên 300 
    { duration: '15s', target: 300 },  // Duy trì
    { duration: '10s', target: 10 },  
    { duration: '10s', target: 0 },    
  ],
};

export default function () {
  
  const loginRes = http.post(`${BASE_URL}/login`, JSON.stringify({ email: 'dvn150903@gmail.com', password: '12345678' }), { headers: { 'Content-Type': 'application/json' } });
  check(loginRes, { 'status 200': (r) => r.status === 200 });
  
  const productListRes = http.get(`${BASE_URL}/products?page=1&limit=12`);
  check(productListRes, { 'status 200': (r) => r.status === 200 });
}
