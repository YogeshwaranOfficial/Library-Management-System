import { Router } from 'express';
import validate from '../../middlewares/validate.js';
import { 
  addUserValidation, 
  updateUserValidation, 
  deleteUserValidation,
  addLibrarianValidation,
  updateLibrarianValidation,
  deleteLibrarianValidation
} from './admin.validation.js';
import { AdminController } from '../admin/admin.controller.js';
import auth from "../../middlewares/auth.js";


const router = Router();
const controller = new AdminController();

// ==========================================
// 👥 ENDPOINTS FOR READERS (USERS)
// ==========================================
router.get('/readers', auth, controller.getReaders);
router.post('/add-user', auth, validate(addUserValidation), controller.addUser);
router.patch('/user/:user_id', auth, validate(updateUserValidation), controller.updateUser);
router.delete('/user/:user_id', auth, validate(deleteUserValidation), controller.deleteUser);

// ==========================================
// 🛠️ ENDPOINTS FOR LIBRARIANS
// ==========================================
router.get('/librarians', auth, controller.getLibrarians);

// 💡 NEW: Provision a fresh administrative node
router.post('/add-librarian', auth, validate(addLibrarianValidation), controller.addLibrarian);

// 💡 NEW: Modify existing librarian operational profiles via user_id
router.patch('/librarian/:user_id', auth, validate(updateLibrarianValidation), controller.updateLibrarian);

// 💡 NEW: Hard-purge a librarian profile from the cluster matrix
router.delete('/librarian/:user_id', auth, validate(deleteLibrarianValidation), controller.deleteLibrarian);

export default router;