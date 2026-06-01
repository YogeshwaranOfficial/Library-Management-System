import { jest } from "@jest/globals";

// 1. Setup Jest ESM Mocks
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

// 2. Dynamic imports to capture mocked implementations
const { registerUserService, loginUserService } = await import("./auth.service.js");
const { createUser, findUserByEmail } = await import("./auth.repository.js");
const { default: bcrypt } = await import("bcrypt");
const { generateToken } = await import("../../utils/jwt.js");
const { default: AppError } = await import("../../utils/AppError.js");

// 3. Cast directly to 'any' to break the strict 'never' type restriction completely
const mockFindUserByEmail = findUserByEmail as any;
const mockCreateUser = createUser as any;
const mockHash = bcrypt.hash as any;
const mockCompare = bcrypt.compare as any;

describe("🔒 Authentication Service (Isolated Unit Tests)", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // REGISTER USER TEST SUITE
  // ==========================================
  describe("🔄 registerUserService Context", () => {
    const mockRegisterInput = {
      name: "John Doe",
      gmail: "johndoe@gmail.com",
      password: "Password123!",
    };

    it("🟢 Happy Path: Should hash password and create user if email is unique", async () => {
      // Arrange
      mockFindUserByEmail.mockResolvedValue(null);
      mockHash.mockResolvedValue("hashed_password_string");
      mockCreateUser.mockResolvedValue({
        uuid: "mock-user-uuid",
        ...mockRegisterInput,
        password: "hashed_password_string",
      });

      // Act
      const result = await registerUserService(mockRegisterInput);

      // Assert
      expect(mockFindUserByEmail).toHaveBeenCalledWith(mockRegisterInput.gmail);
      expect(mockHash).toHaveBeenCalledWith(mockRegisterInput.password, 10);
      expect(mockCreateUser).toHaveBeenCalledWith({
        ...mockRegisterInput,
        password: "hashed_password_string",
      });
      expect(result).toHaveProperty("uuid", "mock-user-uuid");
    });

    it("🔴 Sad Path: Should throw a 409 AppError if user email already exists", async () => {
      // Arrange
      mockFindUserByEmail.mockResolvedValue({ uuid: "existing-uuid" });

      // Act & Assert
      await expect(registerUserService(mockRegisterInput))
        .rejects
        .toThrow(new AppError("User already exists", 409));

      expect(mockHash).not.toHaveBeenCalled();
      expect(mockCreateUser).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // LOGIN USER TEST SUITE
  // ==========================================
  describe("🔑 loginUserService Context", () => {
    const mockLoginInput = {
      gmail: "johndoe@gmail.com",
      password: "Password123!",
    };

    const mockDbUser = {
      uuid: "mock-user-uuid",
      gmail: "johndoe@gmail.com",
      password: "hashed_password_in_db",
      role: "user",
    };

    it("🟢 Happy Path: Should sign a JWT token and return user details on valid credentials", async () => {
      // Arrange
      mockFindUserByEmail.mockResolvedValue(mockDbUser);
      mockCompare.mockResolvedValue(true);
      (generateToken as jest.Mock).mockReturnValue("mocked_jwt_token_string");

      // Act
      const result = await loginUserService(mockLoginInput);

      // Assert
      expect(mockFindUserByEmail).toHaveBeenCalledWith(mockLoginInput.gmail);
      expect(mockCompare).toHaveBeenCalledWith(mockLoginInput.password, mockDbUser.password);
      expect(generateToken).toHaveBeenCalledWith({
        userId: mockDbUser.uuid,
        gmail: mockDbUser.gmail,
        role: mockDbUser.role,
      });
      expect(result).toEqual({
        token: "mocked_jwt_token_string",
        user: mockDbUser,
      });
    });

    it("🔴 Sad Path: Should throw a 401 AppError if user email does not exist", async () => {
      // Arrange
      mockFindUserByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(loginUserService(mockLoginInput))
        .rejects
        .toThrow(new AppError("Invalid email or password", 401));

      expect(mockCompare).not.toHaveBeenCalled();
      expect(generateToken).not.toHaveBeenCalled();
    });

    it("🔴 Sad Path: Should throw a 401 AppError if the password check fails", async () => {
      // Arrange
      mockFindUserByEmail.mockResolvedValue(mockDbUser);
      mockCompare.mockResolvedValue(false);

      // Act & Assert
      await expect(loginUserService(mockLoginInput))
        .rejects
        .toThrow(new AppError("Invalid email or password", 401));

      expect(generateToken).not.toHaveBeenCalled();
    });
  });
});