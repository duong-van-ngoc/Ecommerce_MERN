import dotenv from "dotenv";
import { fileURLToPath } from "url";

let envLoaded = false;

export const loadEnvironment = () => {
    if (envLoaded) {
        return;
    }

    // Skip loading local config.env if running on Vercel
    if (!process.env.VERCEL) {
        dotenv.config({
            path: fileURLToPath(new URL("./config.env", import.meta.url))
        });
    }

    envLoaded = true;
};
