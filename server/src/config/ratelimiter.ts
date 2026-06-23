import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 2000,

  message: {
    success: false,

    message:
      "Too many requests from this IP. Please try again later.",
  },

  standardHeaders: true,

  legacyHeaders: false,
});

export default rateLimiter;