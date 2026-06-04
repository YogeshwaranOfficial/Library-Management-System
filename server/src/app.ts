import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import './database/associations/index.js';
import notFoundHandler from "./middlewares/notFoundHandler.js";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import routes from "./routes/index.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./docs/swagger/swagger.config.js";
import rateLimiter from "./config/ratelimiter.js";
import helmetConfig from "./config/helmet.js";
import corsConfig from "./config/cors.js";
import "./config/validateEnv.js";



const app: Application = express();

/* -------------------------------------------------------------------------- */
/* GLOBAL MIDDLEWARES                          */
/* -------------------------------------------------------------------------- */

// 1. Core Security & Rate Limiting Headers
app.use(helmetConfig); 
app.use(helmet()); 
app.use(corsConfig); // Use your custom centralized config safely

// 2. Traffic Flow Rate Limiting
app.use(rateLimiter);

// 3. Request Logging & Body Parsing
// Log request details automatically if we are running tests or development
if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); 
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* -------------------------------------------------------------------------- */
/* API DOCUMENTATION                            */
/* -------------------------------------------------------------------------- */
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

/* -------------------------------------------------------------------------- */
/* ROUTES                                   */
/* -------------------------------------------------------------------------- */

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Library Management System API running successfully",
  });
});

// Primary application API routes mounted before error boundaries
app.use("/api/v1", routes);

/* -------------------------------------------------------------------------- */
/* ERROR HANDLING BOUNDARIES                      */
/* -------------------------------------------------------------------------- */

// These must remain at the very bottom of the middleware lifecycle stack!
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;