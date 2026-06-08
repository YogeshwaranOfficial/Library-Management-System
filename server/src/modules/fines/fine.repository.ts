import { literal } from "sequelize";
import Fine from "../../database/models/Fine.js";

// Reusable subquery attributes to keep methods DRY and clean
const sharedFineAttributes = [
  // 🔗 Fetching Issue details safely
  [literal(`(SELECT borrowed_date FROM issues WHERE issues.issue_id = "Fine".issue_id)`), 'borrowed_date'],
  [literal(`(SELECT due_date FROM issues WHERE issues.issue_id = "Fine".issue_id)`), 'due_date'],
  
  // 👤 Pulling User credentials up through the Member link
  [literal(`(
    SELECT u.name FROM users u 
    JOIN members m ON m.user_id = u.uuid 
    WHERE m.member_id = (SELECT member_id FROM issues WHERE issues.issue_id = "Fine".issue_id)
  )`), 'memberName'],
  
  [literal(`(
    SELECT u.gmail FROM users u 
    JOIN members m ON m.user_id = u.uuid 
    WHERE m.member_id = (SELECT member_id FROM issues WHERE issues.issue_id = "Fine".issue_id)
  )`), 'memberEmail'],

  [literal(`(
    SELECT u.phone_number FROM users u 
    JOIN members m ON m.user_id = u.uuid 
    WHERE m.member_id = (SELECT member_id FROM issues WHERE issues.issue_id = "Fine".issue_id)
  )`), 'memberPhone'],

  // 📚 Pulling Book details safely
  [literal(`(
    SELECT b.book_name FROM books b 
    WHERE b.book_id = (SELECT book_id FROM issues WHERE issues.issue_id = "Fine".issue_id)
  )`), 'bookTitle'],

  [literal(`(
    SELECT b.book_author FROM books b 
    WHERE b.book_id = (SELECT book_id FROM issues WHERE issues.issue_id = "Fine".issue_id)
  )`), 'bookAuthor'],

  // 💳 Fetching Membership Status & Expiry details
  [literal(`(
    SELECT m.expiry_date FROM members m 
    WHERE m.member_id = (SELECT member_id FROM issues WHERE issues.issue_id = "Fine".issue_id)
  )`), 'expiry_date'],

  [literal(`(
    SELECT m.membership_status FROM members m 
    WHERE m.member_id = (SELECT member_id FROM issues WHERE issues.issue_id = "Fine".issue_id)
  )`), 'membership_status'],

  [literal(`(
    SELECT p.plan_name FROM membership_plans p
    JOIN members m ON m.membership_plan_id = p.membership_plan_id
    WHERE m.member_id = (SELECT member_id FROM issues WHERE issues.issue_id = "Fine".issue_id)
  )`), 'planName']
];

class FineRepository {
  // 🔒 Fetches active unpaid dues
  async getPendingFines() {
    return Fine.findAll({
      where: { paid_status: false },
      attributes: { include: sharedFineAttributes as any },
      order: [["created_at", "DESC"]]
    });
  }

  // 🟢 Added: Fetches historical collection records
  async getCollectedFines() {
    return Fine.findAll({
      where: { paid_status: true },
      attributes: { include: sharedFineAttributes as any },
      order: [["updated_at", "DESC"]] // Order history by settlement recency
    });
  }

  // 🔒 Fetches single fine by database primary key identity
  async getFineById(fine_id: string) {
    return Fine.findByPk(fine_id, {
      attributes: { include: sharedFineAttributes as any }
    });
  }

  // 🔒 Fetches target history for personal dashboard profile pipelines
  async getMemberFines(member_id: string) {
    return Fine.findAll({
      where: { fine_id: member_id },
      attributes: { include: sharedFineAttributes as any },
      order: [["created_at", "DESC"]]
    });
  }

  // 🔒 Commits fine payment payload updates
  async payFine(fine_id: string, paymentData: { paid_status: boolean; paid_date: Date; payment_method: string }) {
    await Fine.update(paymentData, { where: { fine_id } });
    return this.getFineById(fine_id);
  }

  // 🟢 Added: Drops structural line nodes completely out of the table caches
  async purgeFine(fine_id: string) {
    return Fine.destroy({
      where: { fine_id }
    });
  }


// 🟢 Added: Restores a settled fine back to unpaid status
  async restoreFine(fine_id: string) {
    return Fine.update(
      { 
        paid_status: false, 
        paid_date: null,
      },
      { where: { fine_id } }
    );
  }
}

export default new FineRepository();