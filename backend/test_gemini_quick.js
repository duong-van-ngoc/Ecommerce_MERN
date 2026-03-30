import { loadEnvironment } from "./config/loadEnv.js";
loadEnvironment();

import { GoogleGenerativeAI } from "@google/generative-ai";

async function quickTest() {
    console.log("API Key:", process.env.GEMINI_API_KEY ? "Set" : "Missing");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    try {
        const res = await model.generateContent("Noi xin chao bang tieng Viet, 1 cau ngan");
        console.log("Gemini Response:", res.response.text());
    } catch (error) {
        console.error("Gemini Test Error:", error.message);
        console.error("Gemini Test Full Error:", JSON.stringify(error, null, 2));
    }
}

quickTest();
