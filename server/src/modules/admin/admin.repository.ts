import User from '../../database/models/User.js'; // Adjust path to your Sequelize User model
import { UserAttributes } from '../admin/admin.types.js';

export class AdminRepository {
  // 1. Queries users matching a specific role profile cleanly
  async findUsersByRole(role: 'READER' | 'LIBRARIAN'): Promise<User[]> {
    return await User.findAll({
      where: { role },
      attributes: ['uuid', 'name', 'gmail', 'phone_number', 'role', 'created_at'],
      order: [['created_at', 'DESC']],
    });
  }

  async createUserRepository(
    data: Omit<UserAttributes, 'created_at' | 'updated_at'> & { password?: string }
  ): Promise<User> {
    return await User.create(data as any); 
  }

  // 3. Update existing user details (Matches against your 'uuid' column handle)
  async updateUserRepository(uuid: string, updateData: Partial<Omit<UserAttributes, 'role'>>): Promise<[number]> {
    return await User.update(updateData, {
      where: { uuid }
    });
  }

  // 4. Force Purge / Delete user execution vector from core logs entirely
  async deleteUserRepository(uuid: string): Promise<number> {
    return await User.destroy({
      where: { uuid }
    });
  }
}