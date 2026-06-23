import cors from "cors";

const allowedOrigins = [
  "https://library-management-system-by-yogeshwaran.vercel.app",
  "http://localhost:5173", // Keep this so local testing doesn't break
];

const corsConfig = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200 // Vital for older browsers and some preflight handlers
});

export default corsConfig;