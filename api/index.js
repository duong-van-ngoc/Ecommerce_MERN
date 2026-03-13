import app from "../backend/app.js";
import { initializeApp } from "../backend/config/bootstrap.js";

let isInitialized = false;

export default async function handler(req, res) {
  if (!isInitialized) {
    await initializeApp();
    isInitialized = true;
  }

  return app(req, res);
}