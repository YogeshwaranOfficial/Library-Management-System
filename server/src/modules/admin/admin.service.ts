import { AdminRepository } from '../admin/admin.repository.js';
import { AdminUserResponseDto, UserAttributes } from '../admin/admin.types.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

export class AdminService {
  private adminRepository = new AdminRepository();

  // 1. Compile clean Reader account profile records
  async getReadersFeed(
  limit: number,
  offset: number,
  search?: string
): Promise<{ data: AdminUserResponseDto[]; totalCount: number }> {
  
  // 1. Fetch filtered and chunked data + overall total count from DB
  const { rows: readers, count: totalCount } = await this.adminRepository.findUsersByRole(
    'READER',
    limit,
    offset,
    search
  );

  // 2. Map the database row properties into the expected frontend payload contract
  const mappedData = readers.map(user => ({
    user_id: user.uuid,
    name: user.name,
    gmail: user.gmail,
    phone_number: user.phone_number,
    role: user.role,
    created_at: user.created_at
  }));

  // 3. Return the composite wrapper object
  return {
    data: mappedData,
    totalCount: totalCount
  };
}

  // 2. Compile clean Librarian account profile records
 // Inside admin.service.ts

async getLibrariansFeed(
  limit: number,
  offset: number,
  search?: string
): Promise<{ data: AdminUserResponseDto[]; totalCount: number }> {
  
  // 💡 FIXED: Passes all 3 mandatory parameters to the repository
  const { rows: librarians, count: totalCount } = await this.adminRepository.findUsersByRole(
    'LIBRARIAN',
    limit,
    offset,
    search
  );

  // 💡 FIXED: Maps over .rows instead of the raw parent object wrapper
  const mappedData = librarians.map((user: any) => ({
    user_id: user.uuid,
    name: user.name,
    gmail: user.gmail,
    phone_number: user.phone_number,
    role: user.role,
    created_at: user.created_at
  }));

  return {
    data: mappedData,
    totalCount: totalCount
  };
}

  // 3. Execute new account creation business logic (For Readers)
  async createUser(
    payload: Omit<UserAttributes, 'uuid' | 'created_at' | 'updated_at'> & { password?: string }
  ): Promise<AdminUserResponseDto> {
    
    const generatedUuid = crypto.randomUUID();
    let finalizedPassword = payload.password;

    if (finalizedPassword) {
      const saltRounds = 10;
      finalizedPassword = await bcrypt.hash(finalizedPassword, saltRounds);
    }

    const userCreationData = {
      ...payload,
      uuid: generatedUuid,
      ...(finalizedPassword && { password: finalizedPassword }),
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

  // 4. Update structural details for existing directory rows (For Readers)
  async updateUser(user_id: string, updateData: Partial<Omit<UserAttributes, 'role' | 'uuid' | 'created_at' | 'updated_at'>> & { password?: string }): Promise<void> {
    const [affectedCount] = await this.adminRepository.updateUserRepository(user_id, updateData);
    
    if (affectedCount === 0) {
      throw new Error("Target account profile was not tracked on this cluster matrix.");
    }
  }

  // 5. Purge and remove accounts entirely from active database shards (For Readers)
  async deleteUser(user_id: string): Promise<void> {
    const deletedCount = await this.adminRepository.deleteUserRepository(user_id);
    
    if (deletedCount === 0) {
      throw new Error("Target account profile was not tracked on this cluster matrix.");
    }
  }

  // ==========================================
  // 💡 LIBRARIAN MANAGEMENT OPERATIONS LAYER
  // ==========================================

  // 6. Execute new Librarian profile creation logic
  async createLibrarian(
    payload: Omit<UserAttributes, 'uuid' | 'role' | 'created_at' | 'updated_at'> & { password?: string }
  ): Promise<AdminUserResponseDto> {
    const generatedUuid = crypto.randomUUID();
    let finalizedPassword = payload.password;

    if (finalizedPassword) {
      const saltRounds = 10;
      finalizedPassword = await bcrypt.hash(finalizedPassword, saltRounds);
    }

    // Force role payload definition to LIBRARIAN 
    const librarianCreationData = {
      ...payload,
      uuid: generatedUuid,
      role: 'LIBRARIAN' as const,
      ...(finalizedPassword && { password: finalizedPassword }),
    };

    const newLibrarianRecord = await this.adminRepository.createLibrarianRepository(librarianCreationData);

    return {
      user_id: newLibrarianRecord.uuid,
      name: newLibrarianRecord.name,
      gmail: newLibrarianRecord.gmail,
      phone_number: newLibrarianRecord.phone_number,
      role: newLibrarianRecord.role,
      created_at: newLibrarianRecord.created_at,
    };
  }

  // 7. Update explicit structural details for an active Librarian profile
  async updateLibrarian(
    user_id: string, 
    updateData: Partial<Omit<UserAttributes, 'role' | 'uuid' | 'created_at' | 'updated_at'>> & { password?: string }
  ): Promise<void> {
    const refinedUpdatePayload: typeof updateData = { ...updateData };

    // 💡 Security Interceptor: Hash incoming password mutations if present
    if (refinedUpdatePayload.password) {
      const saltRounds = 10;
      refinedUpdatePayload.password = await bcrypt.hash(refinedUpdatePayload.password, saltRounds);
    }

    const [affectedCount] = await this.adminRepository.updateLibrarianRepository(user_id, refinedUpdatePayload);
    
    if (affectedCount === 0) {
      throw new Error("Target operational node profile not found.");
    }
  }

  // 8. Purge Librarian entirely from database shards
  async deleteLibrarian(user_id: string): Promise<void> {
    const deletedCount = await this.adminRepository.deleteLibrarianRepository(user_id);
    
    if (deletedCount === 0) {
      throw new Error("Target operational node profile not found.");
    }
  }
}