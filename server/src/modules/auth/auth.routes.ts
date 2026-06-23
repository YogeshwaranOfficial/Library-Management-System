/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 *             required:
 *               - name
 *               - gmail
 *               - password
 *
 *             properties:
 *               name:
 *                 type: string
 *                 example: Yogesh
 *
 *               gmail:
 *                 type: string
 *                 example: yogesh@gmail.com
 *
 *               password:
 *                 type: string
 *                 example: Password@123
 *
 *               phoneNumber:
 *                 type: string
 *                 example: 9876543210
 *
 *     responses:
 *       201:
 *         description: User registered successfully
 *
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *
 *                 data:
 *                   type: object
 *
 *       409:
 *         description: User already exists
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 *             required:
 *               - gmail
 *               - password
 *
 *             properties:
 *               gmail:
 *                 type: string
 *                 example: admin@gmail.com
 *
 *               password:
 *                 type: string
 *                 example: Admin@123
 *
 *     responses:
 *       200:
 *         description: Login successful
 *
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: User logged in successfully
 *
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *
 *                     user:
 *                       type: object
 *
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Auth]
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: Profile fetched successfully
 *
 *                 data:
 *                   type: object
 *
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */

import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validate from "../../middlewares/validate.js";
import {
  loginSchema,
  registerSchema,
} from "./auth.validation.js";

import {
  loginUserController,
  registerUserController,
  getProfileController
} from "./auth.controller.js";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  registerUserController
);

router.post(
  "/login",
  validate(loginSchema),
  loginUserController
);

router.get(
  "/profile",
  auth,
  getProfileController
);

export default router;