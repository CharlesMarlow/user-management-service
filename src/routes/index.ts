import express from 'express';
import {
  registerUser,
  health,
  getUsers,
  deleteUserFromDB,
  handleUserUpdate,
  loginUser,
  verifyLogin,
  requestPasswordChange,
  updatePassword,
  changePassword,
} from '../controllers/index.js';

const router = express.Router();

router.get('/health', health);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUserFromDB);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-login', verifyLogin);
router.put('/update/:id', handleUserUpdate);
router.post('/change-password', requestPasswordChange);
router.put('/update-password', updatePassword);
router.put('/change-password-finalize', changePassword);

export default router;
