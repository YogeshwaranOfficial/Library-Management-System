import winston from "winston";

// 1. Define a professional, clean layout for your terminal/console
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }), // Colors the level and message nicely
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, stack, name }) => {
    // If it's an error, display it professionally with its name
    if (stack) {
      const errorName = name ? `[${name}] ` : "";
      // Only prints the clean error message. 
      // If you WANT the full stack trace in the console, change `message` to `stack` below
      return `${timestamp} ${level}: ${errorName}${message}`;
    }
    
    return `${timestamp} ${level}: ${message}`;
  })
);

// 2. Define the standard JSON layout for your file logs (Production-ready)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }), // Captures full stack traces for debugging files
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "test" ? "error" : "info", // Silences minor logs during npm run test

  transports: [
    // Console transport uses the clean, human-readable format
    new winston.transports.Console({
      format: consoleFormat,
    }),

    // File transports keep the structural JSON format for production record-keeping
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: fileFormat,
    }),

    new winston.transports.File({
      filename: "logs/combined.log",
      format: fileFormat,
    }),
  ],
});

export default logger;