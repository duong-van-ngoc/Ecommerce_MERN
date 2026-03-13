import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, "");
const normalizedApiUrl = rawApiUrl?.endsWith("/api/v1")
  ? rawApiUrl.slice(0, -7)
  : rawApiUrl;

axios.defaults.baseURL = normalizedApiUrl || "";
axios.defaults.withCredentials = true;
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

export default axios;
