import { VNPay, ProductCode, VnpCurrCode, VnpLocale } from 'vnpay';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, 'backend', 'config', 'config.env') });

try {
    const vnpay = new VNPay({
        tmnCode: process.env.VNP_TMN_CODE,
        secureSecret: process.env.VNP_HASH_SECRET,
        vnpayHost: 'https://sandbox.vnpayment.vn',
        testMode: true,
    });

    console.log("VNPay initialized successfully");

    const url = vnpay.buildPaymentUrl({
        vnp_Amount: 10000,
        vnp_IpAddr: '127.0.0.1',
        vnp_TxnRef: 'test_order_123',
        vnp_OrderInfo: 'Test payment',
        vnp_OrderType: ProductCode.OTHER,
        vnp_ReturnUrl: 'http://localhost:3000/callback',
        vnp_Locale: VnpLocale.VN,
        vnp_CurrCode: VnpCurrCode.VND,
        vnp_CreateDate: new Date(),
    });

    console.log("Generated URL:", url);
} catch (error) {
    console.error("Error detected:", error);
}
