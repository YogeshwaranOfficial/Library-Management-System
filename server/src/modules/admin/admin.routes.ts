import { Router } from 'express';
import validate from '../../middlewares/validate.js';
import { addUserValidation, updateUserValidation, deleteUserValidation } from './admin.validation.js';
import { AdminController } from '../admin/admin.controller.js';
// import { protect, restrictTo } from '../middlewares/authMiddleware'; 
// ^ Add your custom RBAC middlewares here to ensure only ADMIN tokens bypass this route!

const router = Router();
const controller = new AdminController();

// Endpoints for readers
router.get('/readers', controller.getReaders);
router.post('/add-user', validate(addUserValidation), controller.addUser);
router.patch('/user/:user_id', validate(updateUserValidation), controller.updateUser);
router.delete('/user/:user_id', validate(deleteUserValidation), controller.deleteUser);

//Endpoints for librarins
router.get('/librarians', controller.getLibrarians);

export default router;