import express from 'express';
import product from './routes/productRoutes.js';
import errorHandleMiddleware from './middleware/error.js';

const app = express();

// middleware
app.use(express.json()); // để đọc dữ liệu dạng json từ client gửi lên


// routes 
app.use("/api/v1", product);

app.use(errorHandleMiddleware); // sử dụng middleware xử lý lỗi
export default app;
