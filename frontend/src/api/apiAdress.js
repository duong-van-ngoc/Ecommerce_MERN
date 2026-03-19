/**
 * ============================================================================
 * COMPONENT: apiAdress
 * ============================================================================
 * 1. Component là gì: 
 *    - Đảm nhiệm vai trò hiển thị và xử lý logic cho vùng phần tử `apiAdress` trong ứng dụng.
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

const API_URL = "/api/v1/address";

const http = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

const getErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return "Có lỗi xảy ra";
};

// Lấy danh sách tỉnh/thành
export const getProvinces = async () => {
  try {
    const res = await http.get("/p/");
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    throw new Error(`getProvinces: ${getErrorMessage(error)}`);
  }
};

// Lấy danh sách quận/huyện theo provinceCode
export const getDistrictsByProvince = async (provinceCode) => {
  if (!provinceCode) return [];
  try {
    const res = await http.get(`/p/${provinceCode}`, { params: { depth: 2 } });
    return res.data?.districts || [];
  } catch (error) {
    throw new Error(`getDistrictsByProvince: ${getErrorMessage(error)}`);
  }
};

// Lấy danh sách phường/xã theo districtCode
export const getWardsByDistrict = async (districtCode) => {
  if (!districtCode) return [];
  try {
    const res = await http.get(`/d/${districtCode}`, { params: { depth: 2 } });
    return res.data?.wards || [];
  } catch (error) {
    throw new Error(`getWardsByDistrict: ${getErrorMessage(error)}`);
  }
};

// Search
export const searchProvinces = async (q) => {
  if (!q?.trim()) return [];
  try {
    const res = await http.get("/p/search/", { params: { q } });
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    throw new Error(`searchProvinces: ${getErrorMessage(error)}`);
  }
};

export const searchDistricts = async (q) => {
  if (!q?.trim()) return [];
  try {
    const res = await http.get("/d/search/", { params: { q } });
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    throw new Error(`searchDistricts: ${getErrorMessage(error)}`);
  }
};

export const searchWards = async (q) => {
  if (!q?.trim()) return [];
  try {
    const res = await http.get("/w/search/", { params: { q } });
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    throw new Error(`searchWards: ${getErrorMessage(error)}`);
  }
};
