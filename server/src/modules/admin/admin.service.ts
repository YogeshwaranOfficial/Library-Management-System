import { AdminRepository } from '../admin/admin.repository.js';
import { AdminUserResponseDto, UserAttributes } from '../admin/admin.types.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

export class AdminService {
  private adminRepository = new AdminRepository();

  // 1. Compile clean Reader account profile records
  async getReadersFeed(): Promise<AdminUserResponseDto[]> {
    const readers = await this.adminRepository.findUsersByRole('READER');
    return readers.map(user => ({
      user_id: user.uuid,
      name: user.name,
      gmail: user.gmail,
      phone_number: user.phone_number,
      role: user.role,
      created_at: user.created_at
    }));
  }

  // 2. Compile clean Librarian account profile records
  async getLibrariansFeed(): Promise<AdminUserResponseDto[]> {
    const librarians = await this.adminRepository.findUsersByRole('LIBRARIAN');
    return librarians.map(user => ({
      user_id: user.uuid,
      name: user.name,
      gmail: user.gmail,
      phone_number: user.phone_number,
      role: user.role,
      created_at: user.created_at
    }));
  }

  // 3. Execute new account creation business logic
  // 💡 FIXED: The input payload strips the timestamps and UUID, but we add it to the final tracking object safely
  async createUser(
  payload: Omit<UserAttributes, 'uuid' | 'created_at' | 'updated_at'> & { password?: string }
): Promise<AdminUserResponseDto> {
  
  const generatedUuid = crypto.randomUUID();
  let finalizedPassword = payload.password;

  // 💡 Check if a password exists in the payload, then safely encrypt it
  if (finalizedPassword) {
    const saltRounds = 10;
    finalizedPassword = await bcrypt.hash(finalizedPassword, saltRounds);
  }

  // Construct the full object with the generated UUID and securely hashed credentials
  const userCreationData = {
    ...payload,
    uuid: generatedUuid,
    ...(finalizedPassword && { password: finalizedPassword }), // Replaces raw string with secure bcrypt variant
  };

    const newUserRecord = await this.adminRepository.createUserRepository(userCreationData);

    return {
      user_id: newUserRecord.uuid,
      name: newUserRecord.name,
      gmail: newUserRecord.gmail,
      phone_number: newUserRecord.phone_number,
      role: newUserRecord.role,
      created_at: newUserRecord.created_at,
    };
  }

  // 4. Update structural details for existing directory rows
  async updateUser(user_id: string, updateData: Partial<Omit<UserAttributes, 'role' | 'uuid' | 'created_at' | 'updated_at'>> & { password?: string }): Promise<void> {
    const [affectedCount] = await this.adminRepository.updateUserRepository(user_id, updateData);
    
    if (affectedCount === 0) {
      throw new Error("Target account profile was not tracked on this cluster matrix.");
    }
  }

  // 5. Purge and remove accounts entirely from active database shards
  async deleteUser(user_id: string): Promise<void> {
    const deletedCount = await this.adminRepository.deleteUserRepository(user_id);
    
    if (deletedCount === 0) {
      throw new Error("Target account profile was not tracked on this cluster matrix.");
    }
  }
}