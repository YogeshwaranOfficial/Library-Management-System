import { Router } from "express";

import validate from "../../middlewares/validate.js";

import auth from "../../middlewares/auth.js";

import {
  createBookController,
  deleteBookController,
  getBookByIdController,
  getBooksController,
  updateBookController,
} from "./book.controller.js";

import {
  createBookSchema,
  updateBookSchema,
} from "./book.validation.js";

const router = Router();

router.post(
  "/",
  auth,
  validate(createBookSchema),
  createBookController
);

router.get(
  "/",
  auth,
  getBooksController
);

router.get(
  "/:bookId",
  auth,
  getBookByIdController
);

router.patch(
  "/:bookId",
  auth,
  validate(updateBookSchema),
  updateBookController
);

router.delete(
  "/:bookId",
  auth,
  deleteBookController
);

export default router;