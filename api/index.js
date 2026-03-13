import app from "../backend/app.js";
import { initializeApp } from "../backend/config/bootstrap.js";

// Đảm bảo Database được kết nối trước khi xử lý request
await initializeApp();

export default app;

