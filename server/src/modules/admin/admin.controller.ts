import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../admin/admin.service.js';

export class AdminController {
  private adminService = new AdminService();

  // GET /admin/readers
  getReaders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.adminService.getReadersFeed();
      res.status(200).json({
        success: true,
        message: "Readers directory compiled successfully.",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /admin/librarians
  getLibrarians = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.adminService.getLibrariansFeed();
      res.status(200).json({
        success: true,
        message: "Librarians directory compiled successfully.",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /admin/add-user
  addUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user_id, name, gmail, password, phone_number, role } = req.body;
      
      const newReader = await this.adminService.createUser({
        user_id: user_id || "", // 💡 Fixed: Explicitly fulfills the required property check
        name,
        gmail,
        password,
        phone_number,
        role: role || 'READER'
      });

      res.status(201).json({
        success: true,
        message: "New user account provisioned successfully.",
        data: newReader,
      });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /admin/user/:user_id
  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user_id } = req.params;
      const { name, gmail, password, phone_number } = req.body;

      // 💡 Fixed: Coerces the parameter string fallback to satisfy the compiler
      await this.adminService.updateUser(String(user_id || ""), {
        name,
        gmail,
        password,
        phone_number,
      });

      res.status(200).json({
        success: true,
        message: "User context metrics synchronized successfully.",
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /admin/user/:user_id
  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user_id } = req.params;

      // 💡 Fixed: Coerces the parameter string fallback to satisfy the compiler
      await this.adminService.deleteUser(String(user_id || ""));

      res.status(200).json({
        success: true,
        message: "User account file purged from registry matrix completely.",
      });
    } catch (error) {
      next(error);
    }
  };
}