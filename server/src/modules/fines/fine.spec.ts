import { jest } from "@jest/globals";
import httpStatus from "http-status-codes";
import AppError from "../../utils/AppError.js";

// 1. Mock the Repository Layer with a single unified function signature type
const mockFineRepository = {
  getAllFines: jest.fn<(...args: any[]) => any>(),
  getFineById: jest.fn<(...args: any[]) => any>(),
  getMemberFines: jest.fn<(...args: any[]) => any>(),
  payFine: jest.fn<(...args: any[]) => any>(),
  getPendingFines: jest.fn<(...args: any[]) => any>(),
};

jest.unstable_mockModule("./fine.repository.js", () => ({
  default: mockFineRepository,
}));

// 2. Dynamically import service after mocking its dependency module
const { default: fineService } = await import("./fine.service.js");

describe("FineService - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllFines", () => {
    it("🟢 Should return all fines from repository layer smoothly", async () => {
      const mockFines = [
        { fine_id: "fine-1", fine_amount: 120, paid_status: false },
        { fine_id: "fine-2", fine_amount: 80, paid_status: true },
      ];
      mockFineRepository.getAllFines.mockResolvedValue(mockFines);

      const result = await fineService.getAllFines();

      expect(result).toEqual(mockFines);
      expect(mockFineRepository.getAllFines).toHaveBeenCalledTimes(1);
    });
  });

  describe("payFine", () => {
    it("🔴 Sad Path: Should throw 404 AppError if the target fine identifier does not exist", async () => {
      mockFineRepository.getFineById.mockResolvedValue(null);

      await expect(fineService.payFine("invalid-uuid")).rejects.toThrow(
        new AppError("Fine registry record not found", httpStatus.NOT_FOUND)
      );
    });

    it("🔴 Sad Path: Should throw 400 AppError if target fine is already settled", async () => {
      const mockPaidFine = { fine_id: "fine-id", paid_status: true };
      mockFineRepository.getFineById.mockResolvedValue(mockPaidFine);

      await expect(fineService.payFine("fine-id")).rejects.toThrow(
        new AppError("This fine has already been settled", httpStatus.BAD_REQUEST)
      );
    });

    it("🟢 Happy Path: Should cleanly update status parameters and return the settled fine record", async () => {
      const mockUnpaidFine = { fine_id: "fine-id", paid_status: false };
      const mockSettledFine = { fine_id: "fine-id", paid_status: true, paid_date: new Date() };
      
      mockFineRepository.getFineById.mockResolvedValue(mockUnpaidFine);
      mockFineRepository.payFine.mockResolvedValue(mockSettledFine);

      const result = await fineService.payFine("fine-id");

      expect(result).toEqual(mockSettledFine);
      expect(mockFineRepository.payFine).toHaveBeenCalledWith(
        "fine-id",
        expect.objectContaining({ paid_status: true, paid_date: expect.any(Date) })
      );
    });
  });

  describe("getPendingFines", () => {
    it("🟢 Should return only unsettled fine rows from data layer", async () => {
      const mockPending = [{ fine_id: "fine-1", paid_status: false }];
      mockFineRepository.getPendingFines.mockResolvedValue(mockPending);

      const result = await fineService.getPendingFines();

      expect(result).toEqual(mockPending);
    });
  });

  describe("getMemberFines", () => {
    it("🔴 Sad Path: Should throw 400 AppError if parameter is omitted", async () => {
      await expect(fineService.getMemberFines("")).rejects.toThrow(
        new AppError("Member identifier parameter missing", httpStatus.BAD_REQUEST)
      );
    });

    it("🟢 Happy Path: Should invoke repository layer mapping directly using the identifier", async () => {
      const mockMemberFines = [{ fine_id: "fine-1", issue: { member_id: "member-123" } }];
      mockFineRepository.getMemberFines.mockResolvedValue(mockMemberFines);

      const result = await fineService.getMemberFines("member-123");

      expect(result).toEqual(mockMemberFines);
      expect(mockFineRepository.getMemberFines).toHaveBeenCalledWith("member-123");
    });
  });
});