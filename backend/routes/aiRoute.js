import express from "express";
import { chat, clearHistory, getStats } from "../controllers/aiController.js";

const router = express.Router();

router.post("/chat", chat);
router.post("/chat/clear", clearHistory);
router.get("/chat/stats", getStats);

export default router;
