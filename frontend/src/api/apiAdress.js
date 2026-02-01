import axios from "axios";

const API_URL = "https://provinces.open-api.vn/api/v1";

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
    return res.data || [];
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
    return res.data || [];
  } catch (error) {
    throw new Error(`searchProvinces: ${getErrorMessage(error)}`);
  }
};

export const searchDistricts = async (q) => {
  if (!q?.trim()) return [];
  try {
    const res = await http.get("/d/search/", { params: { q } });
    return res.data || [];
  } catch (error) {
    throw new Error(`searchDistricts: ${getErrorMessage(error)}`);
  }
};

export const searchWards = async (q) => {
  if (!q?.trim()) return [];
  try {
    const res = await http.get("/w/search/", { params: { q } });
    return res.data || [];
  } catch (error) {
    throw new Error(`searchWards: ${getErrorMessage(error)}`);
  }
};
