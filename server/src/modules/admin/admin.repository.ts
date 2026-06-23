import User from '../../database/models/User.js'; // Adjust path to your Sequelize User model
import { UserAttributes } from '../admin/admin.types.js';
import { Op } from 'sequelize';

export class AdminRepository {
  
  // 1. Queries users matching a specific role profile cleanly
 async findUsersByRole(
  role: 'READER' | 'LIBRARIAN',
  limit: number,
  offset: number,
  search?: string
): Promise<{ rows: User[]; count: number }> {
  
  // Build a dynamic search condition if a query exists
  const whereCondition: any = { role };

  if (search) {
    whereCondition[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },  // Use Op.like if you are on MySQL instead of PostgreSQL
      { gmail: { [Op.iLike]: `%${search}%` } }
    ];
  }

  // 💡 findAndCountAll returns { rows, count } directly from the DB engine efficiently
  return await User.findAndCountAll({
    where: whereCondition,
    attributes: ['uuid', 'name', 'gmail', 'phone_number', 'role', 'created_at'],
    order: [['created_at', 'DESC']],
    limit: limit,
    offset: offset,
  });
}

  // 2. Base Create User method
  async createUserRepository(
    data: Omit<UserAttributes, 'created_at' | 'updated_at'> & { password?: string }
  ): Promise<User> {
    return await User.create(data as any); 
  }

  // 3. Base Update User details
  async updateUserRepository(uuid: string, updateData: Partial<Omit<UserAttributes, 'role'>>): Promise<[number]> {
    return await User.update(updateData, {
      where: { uuid }
    });
  }

  // 4. Base Force Purge / Delete execution vector
  async deleteUserRepository(uuid: string): Promise<number> {
    return await User.destroy({
      where: { uuid }
    });
  }

  // ==========================================
  // 💡 LIBRARIAN SPECIFIC OPERATIONS OPERATORS
  // ==========================================

  // 5. Create Librarian profile entry
  async createLibrarianRepository(
    data: Omit<UserAttributes, 'created_at' | 'updated_at'> & { password?: string }
  ): Promise<User> {
    // Reuses core creation pipeline while maintaining structural data separation in service
    return await this.createUserRepository(data);
  }

  // 6. Update Librarian details targeting specific UUID
  async updateLibrarianRepository(
    uuid: string, 
    updateData: Partial<Omit<UserAttributes, 'role'>>
  ): Promise<[number]> {
    // Routes modification payload cleanly to the underlying Sequelize update engine
    return await this.updateUserRepository(uuid, updateData);
  }

  // 7. Delete Librarian registry entry completely
  async deleteLibrarianRepository(uuid: string): Promise<number> {
    // Executes direct row isolation deletion via UUID
    return await this.deleteUserRepository(uuid);
  }
}