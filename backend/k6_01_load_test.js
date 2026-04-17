import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000/api/v1';

export const options = {
  
  stages: [
    { duration: '30s', target: 20 },  
    { duration: '1m', target: 20 },   // Duy trì 20 khách trong 1 phút
    { duration: '30s', target: 0 },   
  ],
};

export default function () {
  const loginRes = http.post(`${BASE_URL}/login`, JSON.stringify({ email: 'dvn150903@gmail.com', password: '12345678' }), { headers: { 'Content-Type': 'application/json' } });
  check(loginRes, { 'status 200': (r) => r.status === 200 });
  sleep(1); 
  
  const productListRes = http.get(`${BASE_URL}/products?page=1&limit=12`);
  check(productListRes, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
