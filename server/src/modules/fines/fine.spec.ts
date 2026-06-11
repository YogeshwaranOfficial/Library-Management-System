import { jest } from "@jest/globals";

jest.unstable_mockModule("./fine.repository.js", () => ({
  default: {
    getCollectedFines: jest.fn(),
    getPendingFines: jest.fn(),
    getMemberFines: jest.fn(),
    getFineById: jest.fn(),
    payFine: jest.fn(),
    purgeFine: jest.fn(),
    restoreFine: jest.fn(),
  },
}));

const { default: fineService } =
  await import("./fine.service.js");

const { default: fineRepository } =
  await import("./fine.repository.js");

const mockFineRepository =
  fineRepository as any;

describe("FineService Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fineRecord = {
    fine_id: "fine-1",
    issue_id: "issue-1",
    delayed_days: 5,
    fine_amount: 50,
    paid_status: false,
    due_date: "2026-01-01",
    memberName: "John Doe",
    memberEmail: "john@gmail.com",
    memberPhone: "9999999999",
    bookTitle: "Clean Code",
    bookAuthor: "Robert Martin",
    membership_status: "ACTIVE",
    expiry_date: "2099-01-01",
  };

  describe("getCollectedFines", () => {
    it("should return transformed collected fines", async () => {
      mockFineRepository
        .getCollectedFines
        .mockResolvedValue([fineRecord]);

      const result =
        await fineService.getCollectedFines();

      expect(
        mockFineRepository.getCollectedFines
      ).toHaveBeenCalled();

      expect(result).toHaveLength(1);

      expect(result[0]).toMatchObject({
        fine_id: "fine-1",
        memberName: "John Doe",
        bookTitle: "Clean Code",
        fine_amount: 50,
      });
    });

    it("should throw AppError when repository fails", async () => {
      mockFineRepository
        .getCollectedFines
        .mockRejectedValue(
          new Error("DB Failure")
        );

      await expect(
        fineService.getCollectedFines()
      ).rejects.toMatchObject({
        message:
          "Collected Fines DB Query failed: DB Failure",
      });
    });
  });

  describe("getPendingFines", () => {
    it("should return transformed pending fines", async () => {
      mockFineRepository
        .getPendingFines
        .mockResolvedValue([fineRecord]);

      const result =
        await fineService.getPendingFines();

      expect(
        mockFineRepository.getPendingFines
      ).toHaveBeenCalled();

      expect(result).toHaveLength(1);
    });

    it("should throw AppError when repository fails", async () => {
      mockFineRepository
        .getPendingFines
        .mockRejectedValue(
          new Error("DB Failure")
        );

      await expect(
        fineService.getPendingFines()
      ).rejects.toMatchObject({
        message:
          "Pending Fines Query Error: DB Failure",
      });
    });
  });

  describe("getMemberFines", () => {
    it("should return member fines", async () => {
      mockFineRepository
        .getMemberFines
        .mockResolvedValue([fineRecord]);

      const result =
        await fineService.getMemberFines(
          "member-1"
        );

      expect(
        mockFineRepository.getMemberFines
      ).toHaveBeenCalledWith(
        "member-1"
      );

      expect(result).toHaveLength(1);
    });

    it("should throw when member id missing", async () => {
      await expect(
        fineService.getMemberFines("")
      ).rejects.toMatchObject({
        message:
          "Member identifier parameter missing",
      });
    });

    it("should throw when repository fails", async () => {
      mockFineRepository
        .getMemberFines
        .mockRejectedValue(
          new Error("DB Failure")
        );

      await expect(
        fineService.getMemberFines(
          "member-1"
        )
      ).rejects.toMatchObject({
        message:
          "Member Fines Query Error: DB Failure",
      });
    });
  });

  describe("payFine", () => {
    it("should pay fine successfully", async () => {
      const paidFine = {
        ...fineRecord,
        paid_status: true,
      };

      mockFineRepository
        .getFineById
        .mockResolvedValue(fineRecord);

      mockFineRepository
        .payFine
        .mockResolvedValue(paidFine);

      const result =
        await fineService.payFine(
          "fine-1",
          "2026-01-10",
          "UPI"
        );

      expect(
        mockFineRepository.payFine
      ).toHaveBeenCalled();

      expect(result.paid_status)
        .toBe(true);
    });

    it("should use current date when paidDate is null", async () => {
      const paidFine = {
        ...fineRecord,
        paid_status: true,
      };

      mockFineRepository
        .getFineById
        .mockResolvedValue(fineRecord);

      mockFineRepository
        .payFine
        .mockResolvedValue(paidFine);

      await fineService.payFine(
        "fine-1",
        null,
        "CASH"
      );

      expect(
        mockFineRepository.payFine
      ).toHaveBeenCalled();
    });

    it("should throw when fine not found", async () => {
      mockFineRepository
        .getFineById
        .mockResolvedValue(null);

      await expect(
        fineService.payFine(
          "fine-1",
          null,
          "UPI"
        )
      ).rejects.toMatchObject({
        message:
          "Fine registry record not found",
      });
    });

    it("should throw when already paid", async () => {
      mockFineRepository
        .getFineById
        .mockResolvedValue({
          ...fineRecord,
          paid_status: true,
        });

      await expect(
        fineService.payFine(
          "fine-1",
          null,
          "UPI"
        )
      ).rejects.toMatchObject({
        message:
          "This fine has already been settled",
      });
    });
  });

  describe("purgeFine", () => {
    it("should purge fine successfully", async () => {
      mockFineRepository
        .getFineById
        .mockResolvedValue(fineRecord);

      mockFineRepository
        .purgeFine
        .mockResolvedValue(1);

      const result =
        await fineService.purgeFine(
          "fine-1"
        );

      expect(
        mockFineRepository.purgeFine
      ).toHaveBeenCalledWith(
        "fine-1"
      );

      expect(result).toBe(1);
    });

    it("should throw when fine id missing", async () => {
      await expect(
        fineService.purgeFine("")
      ).rejects.toMatchObject({
        message:
          "Fine unique identifier parameter is missing",
      });
    });

    it("should throw when fine not found", async () => {
      mockFineRepository
        .getFineById
        .mockResolvedValue(null);

      await expect(
        fineService.purgeFine(
          "fine-1"
        )
      ).rejects.toMatchObject({
        message:
          "Fine registry record target not found for erasure",
      });
    });

    it("should throw repository errors", async () => {
      mockFineRepository
        .getFineById
        .mockResolvedValue(fineRecord);

      mockFineRepository
        .purgeFine
        .mockRejectedValue(
          new Error("DB Failure")
        );

      await expect(
        fineService.purgeFine(
          "fine-1"
        )
      ).rejects.toMatchObject({
        message:
          "Invoice Ledger Clearance Error: DB Failure",
      });
    });
  });

  describe("restoreFine", () => {
    it("should restore fine successfully", async () => {
      mockFineRepository
        .getFineById
        .mockResolvedValue(fineRecord);

      mockFineRepository
        .restoreFine
        .mockResolvedValue([1]);

      mockFineRepository
        .getFineById
        .mockResolvedValueOnce(
          fineRecord
        )
        .mockResolvedValueOnce({
          ...fineRecord,
          paid_status: false,
        });

      const result =
        await fineService.restoreFine(
          "fine-1"
        );

      expect(
        mockFineRepository.restoreFine
      ).toHaveBeenCalledWith(
        "fine-1"
      );

      expect(result.paid_status)
        .toBe(false);
    });

    it("should throw when fine id missing", async () => {
      await expect(
        fineService.restoreFine("")
      ).rejects.toMatchObject({
        message:
          "Fine unique identifier parameter is missing",
      });
    });

    it("should throw when fine not found", async () => {
      mockFineRepository
        .getFineById
        .mockResolvedValue(null);

      await expect(
        fineService.restoreFine(
          "fine-1"
        )
      ).rejects.toMatchObject({
        message:
          "Fine registry record not found for restoration",
      });
    });

    it("should throw repository errors", async () => {
      mockFineRepository
        .getFineById
        .mockResolvedValue(fineRecord);

      mockFineRepository
        .restoreFine
        .mockRejectedValue(
          new Error("DB Failure")
        );

      await expect(
        fineService.restoreFine(
          "fine-1"
        )
      ).rejects.toMatchObject({
        message:
          "Ledger Restoration Error: DB Failure",
      });
    });
  });
});