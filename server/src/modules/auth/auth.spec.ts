import { jest } from "@jest/globals";

jest.unstable_mockModule("./auth.repository.js", () => ({
  createUser: jest.fn(),
  findUserByEmail: jest.fn(),
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hash: jest.fn(),
    compare: jest.fn(),
  },
}));

jest.unstable_mockModule("../../utils/jwt.js", () => ({
  generateToken: jest.fn(),
}));

const { registerUserService, loginUserService } =
  await import("./auth.service.js");

const { createUser, findUserByEmail } =
  await import("./auth.repository.js");

const { default: bcrypt } =
  await import("bcrypt");

const { generateToken } =
  await import("../../utils/jwt.js");

const mockCreateUser = createUser as any;
const mockFindUserByEmail = findUserByEmail as any;
const mockHash = bcrypt.hash as any;
const mockCompare = bcrypt.compare as any;
const mockGenerateToken = generateToken as any;

describe("Auth Service Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUserService", () => {
    const payload = {
      name: "John Doe",
      gmail: "john@gmail.com",
      password: "Password123",
    };

    it("should register user successfully", async () => {
      mockFindUserByEmail.mockResolvedValue(null);

      mockHash.mockResolvedValue(
        "hashed_password"
      );

      const createdUser = {
        uuid: "user-uuid",
        name: payload.name,
        gmail: payload.gmail,
        password: "hashed_password",
      };

      mockCreateUser.mockResolvedValue(
        createdUser
      );

      const result =
        await registerUserService(payload);

      expect(
        mockFindUserByEmail
      ).toHaveBeenCalledWith(
        payload.gmail
      );

      expect(mockHash).toHaveBeenCalledWith(
        payload.password,
        10
      );

      expect(
        mockCreateUser
      ).toHaveBeenCalledWith({
        ...payload,
        password: "hashed_password",
      });

      expect(result).toEqual(createdUser);
    });

    it("should throw 409 if user already exists", async () => {
      mockFindUserByEmail.mockResolvedValue({
        uuid: "existing-user",
      });

      await expect(
        registerUserService(payload)
      ).rejects.toMatchObject({
        message: "User already exists",
        statusCode: 409,
      });

      expect(mockHash).not.toHaveBeenCalled();

      expect(
        mockCreateUser
      ).not.toHaveBeenCalled();
    });
  });

  describe("loginUserService", () => {
    const payload = {
      gmail: "john@gmail.com",
      password: "Password123",
    };

    const dbUser = {
      uuid: "user-uuid",
      gmail: "john@gmail.com",
      password: "hashed_password",
      role: "ADMIN",
    };

    it("should login successfully", async () => {
      mockFindUserByEmail.mockResolvedValue(
        dbUser
      );

      mockCompare.mockResolvedValue(true);

      mockGenerateToken.mockReturnValue(
        "jwt_token"
      );

      const result =
        await loginUserService(payload);

      expect(
        mockFindUserByEmail
      ).toHaveBeenCalledWith(
        payload.gmail
      );

      expect(
        mockCompare
      ).toHaveBeenCalledWith(
        payload.password,
        dbUser.password
      );

      expect(
        mockGenerateToken
      ).toHaveBeenCalledWith({
        userId: dbUser.uuid,
        gmail: dbUser.gmail,
        role: dbUser.role,
      });

      expect(result).toEqual({
        token: "jwt_token",
        user: dbUser,
      });
    });

    it("should throw 401 when gmail does not exist", async () => {
      mockFindUserByEmail.mockResolvedValue(
        null
      );

      await expect(
        loginUserService(payload)
      ).rejects.toMatchObject({
        message: "Invalid gmail id",
        statusCode: 401,
      });

      expect(
        mockCompare
      ).not.toHaveBeenCalled();

      expect(
        mockGenerateToken
      ).not.toHaveBeenCalled();
    });

    it("should throw 401 when password is invalid", async () => {
      mockFindUserByEmail.mockResolvedValue(
        dbUser
      );

      mockCompare.mockResolvedValue(false);

      await expect(
        loginUserService(payload)
      ).rejects.toMatchObject({
        message: "Invalid password",
        statusCode: 401,
      });

      expect(
        mockGenerateToken
      ).not.toHaveBeenCalled();
    });
  });
});