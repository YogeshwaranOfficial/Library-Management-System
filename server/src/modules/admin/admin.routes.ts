/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Reader and Librarian management APIs
 */

/**
 * @swagger
 * /admin/readers:
 *   get:
 *     summary: Get all readers
 *     description: Retrieve paginated list of reader accounts with optional search filtering.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Pagination offset
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search readers by name or email
 *     responses:
 *       200:
 *         description: Readers fetched successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/add-user:
 *   post:
 *     summary: Create a new reader account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - gmail
 *               - password
 *               - phone_number
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               gmail:
 *                 type: string
 *                 example: johndoe@gmail.com
 *               password:
 *                 type: string
 *                 example: Password123
 *               phone_number:
 *                 type: string
 *                 example: "9876543210"
 *               role:
 *                 type: string
 *                 enum: [READER, LIBRARIAN]
 *                 default: READER
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/user/{user_id}:
 *   patch:
 *     summary: Update reader account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               gmail:
 *                 type: string
 *               password:
 *                 type: string
 *               phone_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *
 *   delete:
 *     summary: Delete reader account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /admin/librarians:
 *   get:
 *     summary: Get all librarians
 *     description: Retrieve paginated list of librarian accounts.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Librarians fetched successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/add-librarian:
 *   post:
 *     summary: Create a new librarian account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - gmail
 *               - password
 *               - phone_number
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Smith
 *               gmail:
 *                 type: string
 *                 example: librarian@gmail.com
 *               password:
 *                 type: string
 *                 example: Password123
 *               phone_number:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       201:
 *         description: Librarian created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/librarian/{user_id}:
 *   patch:
 *     summary: Update librarian account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               gmail:
 *                 type: string
 *               password:
 *                 type: string
 *               phone_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: Librarian updated successfully
 *       404:
 *         description: Librarian not found
 *
 *   delete:
 *     summary: Delete librarian account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Librarian deleted successfully
 *       404:
 *         description: Librarian not found
 */


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