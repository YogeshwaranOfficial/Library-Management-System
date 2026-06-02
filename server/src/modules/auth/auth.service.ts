import bcrypt from "bcrypt";

import AppError from "../../utils/AppError.js";

import {
  createUser,
  findUserByEmail,
} from "./auth.repository.js";

import {
  LoginUserInput,
  RegisterUserInput,
} from "./auth.types.js";

import { generateToken } from "../../utils/jwt.js";

export const registerUserService = async (
  payload: RegisterUserInput
) => {
  const existingUser = await findUserByEmail(
    payload.gmail
  );

  if (existingUser) {
    throw new AppError(
      "User already exists",409
    );
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    10
  );

  const newUser = await createUser({
    ...payload,
    password: hashedPassword,
  });

  return newUser;
};

export const loginUserService = async (
  payload: LoginUserInput
) => {
  const user = await findUserByEmail(
    payload.gmail
  );

  if (!user) {
    throw new AppError(
      "Invalid gmail id",401
    );
  }

  const isPasswordMatched =
    await bcrypt.compare(
      payload.password,
      user.password
    );

  if (!isPasswordMatched) {
    throw new AppError(
      "Invalid password",401
    );
  }

  const token = generateToken({
    userId: user.uuid,
    gmail: user.gmail,
    role: user.role,
  });

  return {
    token,
    user,
  };
};

