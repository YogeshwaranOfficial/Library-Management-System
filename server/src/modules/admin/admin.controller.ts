import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../admin/admin.service.js';

export class AdminController {
  private adminService = new AdminService();
// GET /admin/readers
getReaders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 💡 FIXED: Extract the query parameters from the incoming request URL
    const { limit, offset, search } = req.query;

    // Convert string inputs from the URL query into standard numbers with safe fallbacks
    const parsedLimit = limit ? parseInt(limit as string, 10) : 10;
    const parsedOffset = offset ? parseInt(offset as string, 10) : 0;
    const searchQuery = search ? (search as string) : undefined;

    // Pass the pagination parameters to your service layer
    const result = await this.adminService.getReadersFeed(parsedLimit, parsedOffset, searchQuery);

    res.status(200).json({
      success: true,
      message: "Readers directory compiled successfully.",
      // 💡 Note: Your frontend expects the final array inside 'data' or 'data.data'.
      // If your frontend uses 'res.data?.data', passing 'result' directly works perfectly!
      data: result, 
    });
  } catch (error) {
    next(error);
  }
};

// GET /admin/librarians
getLibrarians = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 💡 FIXED: Extract the query parameters for librarians as well
    const { limit, offset, search } = req.query;

    const parsedLimit = limit ? parseInt(limit as string, 10) : 10;
    const parsedOffset = offset ? parseInt(offset as string, 10) : 0;
    const searchQuery = search ? (search as string) : undefined;

    // Pass the pagination parameters to your service layer
    const result = await this.adminService.getLibrariansFeed(parsedLimit, parsedOffset, searchQuery);

    res.status(200).json({
      success: true,
      message: "Librarians directory compiled successfully.",
      data: result,
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
        user_id: user_id || "", 
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

      await this.adminService.deleteUser(String(user_id || ""));

      res.status(200).json({
        success: true,
        message: "User account file purged from registry matrix completely.",
      });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // 💡 LIBRARIAN OPERATIONS DIRECTORY HANDLERS
  // ==========================================

  // POST /admin/add-librarian
  addLibrarian = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user_id, name, gmail, password, phone_number } = req.body;

      const newLibrarian = await this.adminService.createLibrarian({
        user_id: user_id || "",
        name,
        gmail,
        password,
        phone_number,
      });

      res.status(201).json({
        success: true,
        message: "New administrative terminal clearance provisioned.",
        data: newLibrarian,
      });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /admin/librarian/:user_id
  updateLibrarian = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user_id } = req.params;
      const { name, gmail, password, phone_number } = req.body;

      await this.adminService.updateLibrarian(String(user_id || ""), {
        name,
        gmail,
        password,
        phone_number,
      });

      res.status(200).json({
        success: true,
        message: "Officer metrics updated successfully.",
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /admin/librarian/:user_id
  deleteLibrarian = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user_id } = req.params;

      await this.adminService.deleteLibrarian(String(user_id || ""));

      res.status(200).json({
        success: true,
        message: "Librarian security profile wiped from core systems.",
      });
    } catch (error) {
      next(error);
    }
  };
}