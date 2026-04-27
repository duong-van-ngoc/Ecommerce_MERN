import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000/api/v1';

export const options = {
 
  stages: [
    { duration: '30s', target: 50 },  
    { duration: '30s', target: 100 }, 
    { duration: '30s', target: 200 }, 
    { duration: '30s', target: 0 },   
  ],
};

export default function () {
  const loginRes = http.post(`${BASE_URL}/login`, JSON.stringify({ email: 'dvn150903@gmail.com', password: '12345678' }), { headers: { 'Content-Type': 'application/json' } });
  check(loginRes, { 'status 200': (r) => r.status === 200 });
  sleep(0.5); // Giảm thời gian nghỉ để ép server hoạt động nhiều hơn
  
  const productListRes = http.get(`${BASE_URL}/products?page=1&limit=12`);
  check(productListRes, { 'status 200': (r) => r.status === 200 });
  sleep(0.5);
}
