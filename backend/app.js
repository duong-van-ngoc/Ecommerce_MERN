import dotenv from 'dotenv';
dotenv.config({path: "backend/config/config.env"}); // sử dụng file config.env để load các biến môi trường

import express from 'express';
import product from './routes/productRoutes.js';
import user from './routes/userRoutes.js'
import order from './routes/orderRoutes.js'
import errorHandleMiddleware from './middleware/error.js';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
const app = express();


// middleware
app.use(express.json()); // để đọc dữ liệu dạng json từ client gửi lên
app.use(cookieParser()); // để đọc cookie
app.use(fileUpload());  // để upload file
// routes 
app.use("/api/v1", product); 
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use(errorHandleMiddleware); // sử dụng middleware xử lý lỗi

export default app;
