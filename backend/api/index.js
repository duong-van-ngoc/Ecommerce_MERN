import app from "../app.js";
import { initializeApp } from "../config/bootstrap.js";

let isInitialized = false;

export default async function handler(req, res) {
  try {
    if (!isInitialized) {
      await initializeApp();
      isInitialized = true;
    }
    return app(req, res);
  } catch (error) {
    console.error("Vercel Function Error:", error);
    res.status(500).json({
      success: false,
      message: "Serverless Function Execution Error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      hint: "Check if all Environment Variables (DB_URI, etc.) are set in Vercel Dashboard."
    });
  }
}