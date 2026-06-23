import { jest } from "@jest/globals";

// ==========================================
// MOCKS
// ==========================================

const mockRepository: any = {
  findUsersByRole: jest.fn(),
  createUserRepository: jest.fn(),
  updateUserRepository: jest.fn(),
  deleteUserRepository: jest.fn(),
  createLibrarianRepository: jest.fn(),
  updateLibrarianRepository: jest.fn(),
  deleteLibrarianRepository: jest.fn(),
};

jest.unstable_mockModule("../admin/admin.repository.js", () => ({
  AdminRepository: jest.fn(() => mockRepository),
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hash: jest.fn(),
  },
}));

jest.unstable_mockModule("crypto", () => ({
  default: {
    randomUUID: jest.fn(),
  },
}));

// ==========================================
// IMPORTS
// ==========================================

const { AdminService } = await import(
  "../admin/admin.service.js"
);

const { default: bcrypt } = await import(
  "bcrypt"
);

const { default: crypto } = await import(
  "crypto"
);

const mockHash = bcrypt.hash as any;
const mockRandomUUID = crypto.randomUUID as any;

// ==========================================
// TEST SUITE
// ==========================================

describe("AdminService Unit Tests", () => {
let adminService: InstanceType<typeof AdminService>;
  beforeEach(() => {
    jest.clearAllMocks();
    adminService = new AdminService();
  });

  // ==========================================
  // GET READERS
  // ==========================================

  describe("getReadersFeed", () => {
    it("should return mapped reader data", async () => {
      const createdAt = new Date();

      mockRepository.findUsersByRole.mockResolvedValue({
        rows: [
          {
            uuid: "reader-1",
            name: "John",
            gmail: "john@gmail.com",
            phone_number: "9999999999",
            role: "READER",
            created_at: createdAt,
          },
        ],
        count: 1,
      });

      const result =
        await adminService.getReadersFeed(
          10,
          0
        );

      expect(
        mockRepository.findUsersByRole
      ).toHaveBeenCalledWith(
        "READER",
        10,
        0,
        undefined
      );

      expect(result).toEqual({
        data: [
          {
            user_id: "reader-1",
            name: "John",
            gmail: "john@gmail.com",
            phone_number: "9999999999",
            role: "READER",
            created_at: createdAt,
          },
        ],
        totalCount: 1,
      });
    });

    it("should pass search parameter", async () => {
      mockRepository.findUsersByRole.mockResolvedValue({
        rows: [],
        count: 0,
      });

      await adminService.getReadersFeed(
        10,
        0,
        "john"
      );

      expect(
        mockRepository.findUsersByRole
      ).toHaveBeenCalledWith(
        "READER",
        10,
        0,
        "john"
      );
    });
  });

  // ==========================================
  // GET LIBRARIANS
  // ==========================================

  describe("getLibrariansFeed", () => {
    it("should return mapped librarian data", async () => {
      const createdAt = new Date();

      mockRepository.findUsersByRole.mockResolvedValue({
        rows: [
          {
            uuid: "lib-1",
            name: "Alex",
            gmail: "alex@gmail.com",
            phone_number: "8888888888",
            role: "LIBRARIAN",
            created_at: createdAt,
          },
        ],
        count: 1,
      });

      const result =
        await adminService.getLibrariansFeed(
          10,
          0
        );

      expect(
        mockRepository.findUsersByRole
      ).toHaveBeenCalledWith(
        "LIBRARIAN",
        10,
        0,
        undefined
      );

      expect(result).toEqual({
        data: [
          {
            user_id: "lib-1",
            name: "Alex",
            gmail: "alex@gmail.com",
            phone_number: "8888888888",
            role: "LIBRARIAN",
            created_at: createdAt,
          },
        ],
        totalCount: 1,
      });
    });

    it("should pass search parameter", async () => {
      mockRepository.findUsersByRole.mockResolvedValue({
        rows: [],
        count: 0,
      });

      await adminService.getLibrariansFeed(
        10,
        0,
        "alex"
      );

      expect(
        mockRepository.findUsersByRole
      ).toHaveBeenCalledWith(
        "LIBRARIAN",
        10,
        0,
        "alex"
      );
    });
  });

  // ==========================================
  // CREATE USER
  // ==========================================

  describe("createUser", () => {
    it("should create user with hashed password", async () => {
      const createdAt = new Date();

      mockRandomUUID.mockReturnValue(
        "generated-uuid"
      );

      mockHash.mockResolvedValue(
        "hashed-password"
      );

      mockRepository.createUserRepository.mockResolvedValue(
        {
          uuid: "generated-uuid",
          name: "John",
          gmail: "john@gmail.com",
          phone_number: "9999999999",
          role: "READER",
          created_at: createdAt,
        }
      );

      const result =
        await adminService.createUser({
          user_id: "",
          name: "John",
          gmail: "john@gmail.com",
          password: "password123",
          phone_number: "9999999999",
          role: "READER",
        } as any);

      expect(mockRandomUUID).toHaveBeenCalled();

      expect(mockHash).toHaveBeenCalledWith(
        "password123",
        10
      );

      expect(
        mockRepository.createUserRepository
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          uuid: "generated-uuid",
          password: "hashed-password",
        })
      );

      expect(result.user_id).toBe(
        "generated-uuid"
      );
    });

    it("should create user without password", async () => {
      mockRandomUUID.mockReturnValue(
        "generated-uuid"
      );

      mockRepository.createUserRepository.mockResolvedValue(
        {
          uuid: "generated-uuid",
          name: "John",
          gmail: "john@gmail.com",
          phone_number: null,
          role: "READER",
          created_at: new Date(),
        }
      );

      await adminService.createUser({
        user_id: "",
        name: "John",
        gmail: "john@gmail.com",
        phone_number: null,
        role: "READER",
      } as any);

      expect(mockHash).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // UPDATE USER
  // ==========================================

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      mockRepository.updateUserRepository.mockResolvedValue(
        [1]
      );

      await expect(
        adminService.updateUser("uuid", {
          name: "Updated",
        })
      ).resolves.toBeUndefined();

      expect(
        mockRepository.updateUserRepository
      ).toHaveBeenCalled();
    });

    it("should throw when user not found", async () => {
      mockRepository.updateUserRepository.mockResolvedValue(
        [0]
      );

      await expect(
        adminService.updateUser("uuid", {})
      ).rejects.toThrow(
        "Target account profile was not tracked on this cluster matrix."
      );
    });
  });

  // ==========================================
  // DELETE USER
  // ==========================================

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      mockRepository.deleteUserRepository.mockResolvedValue(
        1
      );

      await expect(
        adminService.deleteUser("uuid")
      ).resolves.toBeUndefined();
    });

    it("should throw when user not found", async () => {
      mockRepository.deleteUserRepository.mockResolvedValue(
        0
      );

      await expect(
        adminService.deleteUser("uuid")
      ).rejects.toThrow(
        "Target account profile was not tracked on this cluster matrix."
      );
    });
  });

  // ==========================================
  // CREATE LIBRARIAN
  // ==========================================

  describe("createLibrarian", () => {
    it("should force LIBRARIAN role and hash password", async () => {
      mockRandomUUID.mockReturnValue(
        "librarian-uuid"
      );

      mockHash.mockResolvedValue(
        "hashed-password"
      );

      mockRepository.createLibrarianRepository.mockResolvedValue(
        {
          uuid: "librarian-uuid",
          name: "Alex",
          gmail: "alex@gmail.com",
          phone_number: null,
          role: "LIBRARIAN",
          created_at: new Date(),
        }
      );

      await adminService.createLibrarian({
        user_id: "",
        name: "Alex",
        gmail: "alex@gmail.com",
        password: "password123",
        phone_number: null,
      } as any);

      expect(
        mockRepository.createLibrarianRepository
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "LIBRARIAN",
          password: "hashed-password",
        })
      );
    });

    it("should create librarian without password", async () => {
      mockRandomUUID.mockReturnValue(
        "librarian-uuid"
      );

      mockRepository.createLibrarianRepository.mockResolvedValue(
        {
          uuid: "librarian-uuid",
          name: "Alex",
          gmail: "alex@gmail.com",
          phone_number: null,
          role: "LIBRARIAN",
          created_at: new Date(),
        }
      );

      await adminService.createLibrarian({
        user_id: "",
        name: "Alex",
        gmail: "alex@gmail.com",
        phone_number: null,
      } as any);

      expect(mockHash).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // UPDATE LIBRARIAN
  // ==========================================

  describe("updateLibrarian", () => {
    it("should hash password before update", async () => {
      mockHash.mockResolvedValue(
        "hashed-password"
      );

      mockRepository.updateLibrarianRepository.mockResolvedValue(
        [1]
      );

      await adminService.updateLibrarian(
        "uuid",
        {
          password: "new-password",
        }
      );

      expect(mockHash).toHaveBeenCalledWith(
        "new-password",
        10
      );

      expect(
        mockRepository.updateLibrarianRepository
      ).toHaveBeenCalledWith(
        "uuid",
        expect.objectContaining({
          password: "hashed-password",
        })
      );
    });

    it("should throw when librarian not found", async () => {
      mockRepository.updateLibrarianRepository.mockResolvedValue(
        [0]
      );

      await expect(
        adminService.updateLibrarian(
          "uuid",
          {}
        )
      ).rejects.toThrow(
        "Target operational node profile not found."
      );
    });
  });

  // ==========================================
  // DELETE LIBRARIAN
  // ==========================================

  describe("deleteLibrarian", () => {
    it("should delete librarian successfully", async () => {
      mockRepository.deleteLibrarianRepository.mockResolvedValue(
        1
      );

      await expect(
        adminService.deleteLibrarian(
          "uuid"
        )
      ).resolves.toBeUndefined();
    });

    it("should throw when librarian not found", async () => {
      mockRepository.deleteLibrarianRepository.mockResolvedValue(
        0
      );

      await expect(
        adminService.deleteLibrarian(
          "uuid"
        )
      ).rejects.toThrow(
        "Target operational node profile not found."
      );
    });
  });
});