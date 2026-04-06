import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/orderModel.js';

// Load cấu hình môi trường
dotenv.config({ path: 'backend/config/config.env' });

/**
 * Migration Script: Cập nhật trạng thái đơn hàng cũ sang Tiếng Việt
 */
const migrate = async () => {
  try {
    if (!process.env.DB_URI) {
      throw new Error('DB_URI không tồn tại trong file cấu hình.');
    }

    await mongoose.connect(process.env.DB_URI);
    console.log('--- 🛡️ Bắt đầu quá trình Migration Trạng thái Đơn hàng ---');

    // Bảng mapping trạng thái (English/Key -> Vietnamese)
    const statusMapping = {
      'Processing': 'Chờ xử lý',
      'Shipped': 'Đang giao',
      'Delivered': 'Đã giao',
      'Cancelled': 'Đã hủy',
      'pending': 'Chờ xử lý',
      'shipping': 'Đang giao',
      'delivered': 'Đã giao',
      'completed': 'Đã giao'
    };

    let totalModified = 0;

    for (const [oldStatus, newStatus] of Object.entries(statusMapping)) {
      const result = await Order.updateMany(
        { orderStatus: oldStatus },
        { $set: { orderStatus: newStatus } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Đã chuyển ${result.modifiedCount} đơn hàng từ "${oldStatus}" sang "${newStatus}".`);
        totalModified += result.modifiedCount;
      }
    }

    if (totalModified === 0) {
      console.log('ℹ️ Không có đơn hàng cũ nào cần chuyển đổi.');
    } else {
      console.log(`🚀 Tổng cộng đã cập nhật thành công: ${totalModified} đơn hàng.`);
    }

    console.log('--- ✅ Hoàn thành Migration ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi Migration:', error.message);
    process.exit(1);
  }
};

migrate();
