import mongoose from 'mongoose';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { initializeApp } from '../config/bootstrap.js';

const prepareData = async () => {
    try {
        console.log("🚀 Khởi tạo kết nối Database...");
        await initializeApp();

        // 1. CHUẨN BỊ 300 TEST USERS
        console.log("👥 Đang kiểm tra danh sách Test Users...");
        const usersCount = await User.countDocuments({ email: /testuser.*@example\.com/ });
        
        if (usersCount < 300) {
            console.log(`- Đang tạo thêm ${300 - usersCount} users mới...`);
            const userPromises = [];
            for (let i = 1; i <= 300; i++) {
                const email = `testuser${i}@example.com`;
                userPromises.push((async () => {
                    const exists = await User.findOne({ email });
                    if (!exists) {
                        return User.create({
                            name: `Test User ${i}`,
                            email: email,
                            password: 'testpassword123',
                            avatar: {
                                public_id: "avatars/dummy",
                                url: "https://res.cloudinary.com/dummy/image/upload/v1/avatars/dummy.png"
                            }
                        });
                    }
                })());
            }
            await Promise.all(userPromises);
            console.log("✅ Đã chuẩn bị 300 Test Users.");
        } else {
            console.log("✅ Đã có đủ 300 Test Users.");
        }

        // 2. CHUẨN BỊ SẢN PHẨM CÒN HÀNG
        console.log("📦 Đang kiểm tra tồn kho sản phẩm...");
        const product = await Product.findOne({ stock: { $gt: 100 } });
        if (!product) {
            console.log("- Đang cập nhật tồn kho cho một số sản phẩm để test...");
            await Product.updateMany({}, { $set: { stock: 1000 } }, { limit: 10 });
            console.log("✅ Đã cập nhật tồn kho.");
        } else {
            console.log("✅ Sản phẩm đã sẵn sàng.");
        }

        console.log("✨ TẤT CẢ DỮ LIỆU ĐÃ SẴN SÀNG CHO ULTIMATE SCALING TEST!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Lỗi chuẩn bị dữ liệu:", error);
        process.exit(1);
    }
};

prepareData();
