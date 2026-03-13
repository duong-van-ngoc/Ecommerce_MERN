import app from "../app.js";
import { initializeApp } from "../config/bootstrap.js";

let isInitialized = false;

export default async function handler(req, res) {
  if (!isInitialized) {
    await initializeApp();
    isInitialized = true;
  }

  return app(req, res);
}