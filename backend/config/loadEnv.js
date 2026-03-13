import dotenv from "dotenv";
import { fileURLToPath } from "url";

let envLoaded = false;

export const loadEnvironment = () => {
    if (envLoaded) {
        return;
    }

    dotenv.config({
        path: fileURLToPath(new URL("./config.env", import.meta.url))
    });

    envLoaded = true;
};
