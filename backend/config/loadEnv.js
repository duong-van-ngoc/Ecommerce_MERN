import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

let envLoaded = false;

export const loadEnvironment = () => {
    if (envLoaded) {
        return;
    }

    if (!process.env.VERCEL) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const envPath = path.resolve(__dirname, "config.env");
        
        const result = dotenv.config({ path: envPath });
        
        if (result.error) {
            console.error("Lỗi khi nạp config.env:", result.error);
        } else {
            const count = Object.keys(result.parsed || {}).length;
            console.log(`[loadEnv] Đã nạp ${count} biến từ ${envPath}`);
        }
    }

    envLoaded = true;
};
