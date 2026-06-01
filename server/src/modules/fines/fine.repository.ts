import Fine from "../../database/models/Fine.js";
import Issue from "../../database/models/Issue.js";

class FineRepository {
  async getAllFines() {
    return Fine.findAll({
      order: [["created_at", "DESC"]],
    });
  }

  async getFineById(fine_id: string) {
    return Fine.findByPk(fine_id);
  }

  /**
   * OPTIMIZED JOIN: Fetches all fines linked to a specific member in a single database round-trip
   */
  async getMemberFines(member_id: string) {
    return Fine.findAll({
      include: [
        {
          model: Issue,
          as: "issue",
          where: { member_id },
          attributes: ["issue_id", "book_id", "borrowed_date"], // Keep payload light
        },
      ],
      order: [["created_at", "DESC"]],
    });
  }

  async payFine(fine_id: string, paymentData: { paid_status: boolean; paid_date: Date }) {
    await Fine.update(paymentData, {
      where: { fine_id },
    });

    return this.getFineById(fine_id);
  }

  async getPendingFines() {
    return Fine.findAll({
      where: {
        paid_status: false,
      },
      order: [["created_at", "DESC"]],
    });
  }
}

export default new FineRepository();