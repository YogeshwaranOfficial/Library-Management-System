import cors from "cors";

const allowedOrigins = [
  "http://localhost:5173",
];

const corsConfig = cors({
  origin: allowedOrigins,

  credentials: true,
});

export default corsConfig;