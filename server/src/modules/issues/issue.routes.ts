import { Router } from "express";

import auth from "../../middlewares/auth.js";

import validate from "../../middlewares/validate.js";

import {
  borrowBookController,
  getMemberIssuesController,
  returnBookController,
} from "./issue.controller.js";

import {
  createIssueSchema,
  returnBookSchema,
} from "./issue.validation.js";

const router = Router();

router.post(
  "/borrow",
  auth,
  validate(createIssueSchema),
  borrowBookController
);

router.post(
  "/return",
  auth,
  validate(returnBookSchema),
  returnBookController
);

router.get(
  "/member/:memberId",
  auth,
  getMemberIssuesController
);

export default router;