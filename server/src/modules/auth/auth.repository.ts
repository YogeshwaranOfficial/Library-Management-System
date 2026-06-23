import User from "../../database/models/User.js";
import { CreationAttributes } from "sequelize";
import { RegisterUserInput } from "./auth.types.js";

export const createUser = async (
  payload: RegisterUserInput
) => {
  return await User.create(payload as CreationAttributes<User>);
};

export const findUserByEmail = async (
  gmail: string
) => {
  return await User.findOne({
    where: {
      gmail,
    },
  });
};

export const findUserById = async (
  uuid: string
) => {
  return await User.findByPk(uuid);
};