import dotenv from 'dotenv';
dotenv.config({ path: "./backend/config/config.env" });  // sử dụng file config.env để load các biến môi trường

import app from './app.js';
import connectMongoDatabase from './config/db.js';
import {v2 as cloudinary} from 'cloudinary';



connectMongoDatabase(); // kết nối database

// cấu hình cloudinary
cloudinary.config({
    cloud_name:process.env.CLOUNDINARY_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})
// xử lý các lỗi ngoai le 

process.on('uncaughtException', (err) => {
    console.log(`Lỗi:  ${err.message}`);
    console.log(`máy chủ đang tắt vì lỗi ngoại lệ `);
    process.exit(1); // thoat khoi may chu
})


const port = process.env.PORT || 3000; // nếu không có biến môi trường PORT thì sử dụng cổng 5000

const server = app.listen(port,() => {
    console.log(`server hoạt động trên máy chủ: ${port}`);
})



// xử lý các lỗi không mong muốn để tránh làm sập máy chủ
 process.on("unhandledRejection", (err) => {
    console.log(`Lỗi: ${err.message}`);
    console.log(`Máy chủ đang tắt vì lỗi không mong muốn`);

    server.close(() => {
        process.exit(1);
    })
 })


