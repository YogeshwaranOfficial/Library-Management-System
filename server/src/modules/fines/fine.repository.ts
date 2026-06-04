import { literal } from "sequelize";
import Fine from "../../database/models/Fine.js";

class FineRepository {
  async getPendingFines() {
    return Fine.findAll({
      where: {
        paid_status: false
      },
      attributes: {
        include: [
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
        ]
      },
      order: [["created_at", "DESC"]]
    });
  }

  // Rest of your repository configurations stay completely untouched...
  async getAllFines() { return Fine.findAll({ order: [["created_at", "DESC"]] }); }
  async getFineById(fine_id: string) { return Fine.findByPk(fine_id); }
  async getMemberFines(member_id: string) { return Fine.findAll({ where: { fine_id: member_id } }); }
  async payFine(fine_id: string, paymentData: any) {
    await Fine.update(paymentData, { where: { fine_id } });
    return this.getFineById(fine_id);
  }
}

export default new FineRepository();