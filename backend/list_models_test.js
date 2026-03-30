import { GoogleGenerativeAI } from "@google/generative-ai";
import { loadEnvironment } from "./config/loadEnv.js";

loadEnvironment();

async function testModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        console.log("--- Đang kiểm tra danh sách Model khả dụng ---");
        // Đây là cách kiểm tra trực tiếp qua REST API vì thư viện JS đôi khi chặn listModels
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        
        if (data.error) {
            console.error("❌ Lỗi từ Google:", data.error.message);
            return;
        }

        console.log("✅ Các Model bạn có thể dùng:");
        data.models?.forEach(m => console.log(`- ${m.name}`));
        
    } catch (e) {
        console.error("❌ Lỗi thực thi:", e.message);
    }
}

testModels();
