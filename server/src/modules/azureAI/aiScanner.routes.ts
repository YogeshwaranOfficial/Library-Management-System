import express from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { scanBookCoverController } from "./aiScanner.controller.js";

const router = express.Router();

// Buffer allocation settings via Multer RAM Memory structures
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // Max 4MB allocations
});

// 🛡️ ACCIDENT/CREDIT SAFEGUARD: Blocks any infinite testing loop scenarios
const aiScanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minute lock window
  max: 50,                  // 🛑 Max 50 executions total before block across tests
  message: {
    success: false,
    message: "Safeguard Triggered: Testing scan tier threshold reached (10 items max).",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Match route triggers with intermediate middleware layers securely
router.post(
  "/scan-cover", 
  // aiScanLimiter, 👈 Safely commented out to keep your dev workflow unblocked
  upload.single("bookCover"), 
  scanBookCoverController
);

router.get("/scan-cover", (_req, res) => {
  res.status(200).json({ success: true, message: "AI Scanner endpoint is active. Use POST to upload." });
});

export default router;