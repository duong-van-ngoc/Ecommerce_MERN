import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../models/orderModel.js";

dotenv.config();

const migrateOrderCodes = async () => {
    try {
        console.log("--- Bắt đầu Migration Mã đơn hàng ---");
        
        await mongoose.connect(process.env.DB_URI || "mongodb://localhost:27017/ECommerce");
        console.log("✅ Đã kết nối Database");

        const orders = await Order.find({ orderCode: { $exists: false } });
        console.log(`🔍 Tìm thấy ${orders.length} đơn hàng cũ cần cập nhật...`);

        if (orders.length === 0) {
            console.log("✨ Không có đơn hàng nào cần cập nhật. Hoàn tất!");
            process.exit(0);
        }

        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");

        for (const order of orders) {
            let isUnique = false;
            let code = "";
            
            while (!isUnique) {
                const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
                code = `TB-${dateStr}-${randomStr}`;
                
                const existing = await Order.findOne({ orderCode: code });
                if (!existing) isUnique = true;
            }

            order.orderCode = code;
            await order.save({ validateBeforeSave: false });
            console.log(`✅ Đã cập nhật Đơn hàng [${order._id}] -> ${code}`);
        }

        console.log("🎉 Migration hoàn tất thành công!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Lỗi Migration:", error);
        process.exit(1);
    }
};

migrateOrderCodes();
