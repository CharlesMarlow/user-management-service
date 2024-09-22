import { Request, Response } from 'express';
import {
  checkIfUserExists,
  createUser,
  applyUserUpdate,
  verifyUserCredentials,
  updateUserOTP,
  validateOTP,
} from '../models/userModel.js';
import { deleteUser, findUserByEmail, getAllUsers } from '../db/client.js';
import { generateOTP, sendOTP } from '../services/smsService.js';
import { hashPassword } from '../utils.js';

export const health = async (req: Request, res: Response) => {
  return res.status(201).json({ message: 'App is up and running' });
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();

    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users: ', error);
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
};

export const deleteUserFromDB = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await deleteUser(id);
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(`Error deleting user with ID: ${id}`, error);
    return res
      .status(500)
      .json({ message: `Failed to delete user with ID: ${id}` });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, mobile, password } = req.body;

  const user = await checkIfUserExists(email, mobile);
  if (user) {
    return res.status(409).json({
      message: `Conflict: user's ${email} or ${mobile} already exists`,
    });
  }

  const newUser = await createUser(name, email, mobile, password);
  return res
    .status(201)
    .json({ message: 'User registered successfully', user: newUser });
};

export const handleUserUpdate = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updates = req.body;

    await applyUserUpdate(id, updates);
    return res
      .status(200)
      .json({ message: `User with ID ${id} successfully updated` });
  } catch (error) {
    return res
      .status(400)
      .json({ message: `Failed to update user with id: ${id}` });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await findUserByEmail(email);

  try {
    const isValidUser = user && (await verifyUserCredentials(user, password));

    if (isValidUser) {
      // Check if mobile exists before proceeding
      if (!user.mobile) {
        return res
          .status(500)
          .json({ message: 'User mobile number is missing' });
      }

      // Handle OTP flow
      const otp = generateOTP();
      await updateUserOTP(user.id, otp);
      await sendOTP(user.mobile, otp);

      return res
        .status(200)
        .json({ message: 'Credentials confirmed. OTP sent.' });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const verifyLogin = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure OTP and otpTimestamp exist
    if (!user.otp || !user.otpTimestamp) {
      return res.status(500).json({ message: 'OTP not sent' });
    }
    try {
      await validateOTP(user, otp, 'login');
      return res
        .status(200)
        .json({ message: `Login successful for user with ID: ${user.id}` });
    } catch (error) {
      return res.status(401).json({ message: (error as Error).message });
    }
  } catch (error) {
    console.error('Error during login verification:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const requestPasswordChange = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passwordChangeOtp = generateOTP();
    const passwordChangeOtpTimestamp = new Date();

    await applyUserUpdate(user.id, {
      passwordChangeOtp,
      passwordChangeOtpTimestamp,
      isPasswordChangeEligible: false,
    });

    // Send OTP
    await sendOTP(user.mobile, passwordChangeOtp);

    return res.status(200).json({ message: 'OTP sent for password change' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const { email, passwordChangeOtp } = req.body;

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure OTP and otpTimestamp exist
    if (!user.passwordChangeOtp || !user.passwordChangeOtpTimestamp) {
      return res.status(400).json({ message: 'OTP not sent or expired' });
    }

    await validateOTP(user, passwordChangeOtp, 'passwordChange');

    // Mark user as password change eligible
    await applyUserUpdate(user.id, {
      passwordChangeOtp: null,
      passwordChangeOtpTimestamp: null,
      isPasswordChangeEligible: true,
    });

    return res
      .status(200)
      .json({ message: 'OTP verified, eligible to change password' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is eligible to change the password
    if (!user.isPasswordChangeEligible) {
      return res
        .status(403)
        .json({ message: 'SMS verification required to change password' });
    }

    // Hash the new password and update DB
    const hashedPassword = await hashPassword(newPassword);
    await applyUserUpdate(user.id, {
      password: hashedPassword,
      isPasswordChangeEligible: false,
    });

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};
