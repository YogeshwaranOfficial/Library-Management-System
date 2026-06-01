import httpStatus from "http-status-codes";
import AppError from "../../utils/AppError.js";
import fineRepository from "./fine.repository.js";

class FineService {
  async getAllFines() {
    return fineRepository.getAllFines();
  }

  async payFine(fine_id: string) {
    const fine = await fineRepository.getFineById(fine_id);

    if (!fine) {
      throw new AppError("Fine registry record not found", httpStatus.NOT_FOUND);
    }

    if (fine.paid_status) {
      throw new AppError("This fine has already been settled", httpStatus.BAD_REQUEST);
    }

    // Explicit payload preparation for seamless hand-off to the future payments table mapping
    const paymentUpdates = {
      paid_status: true,
      paid_date: new Date(),
    };

    return fineRepository.payFine(fine_id, paymentUpdates);
  }

  async getPendingFines() {
    return fineRepository.getPendingFines();
  }

  async getMemberFines(member_id: string) {
    if (!member_id) {
      throw new AppError("Member identifier parameter missing", httpStatus.BAD_REQUEST);
    }
    return fineRepository.getMemberFines(member_id);
  }
}

export default new FineService();