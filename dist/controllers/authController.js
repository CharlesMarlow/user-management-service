import { checkIfUserExists, createUser, applyUserUpdate, verifyUserCredentials, } from '../models/userModel.js';
import { deleteUser, findUserByEmail, getAllUsers, saveUserUpdate, } from '../db/client.js';
import { generateOTP, sendOTP } from '../services/smsService.js';
export const getUsers = async (req, res) => {
    try {
        const users = await getAllUsers();
        console.log('USERS', users);
        return res.status(200).json(users);
    }
    catch (error) {
        console.error('Error fetching users: ', error);
        return res.status(500).json({ message: 'Failed to fetch users' });
    }
};
export const deleteUserFromDB = async (req, res) => {
    const { id } = req.params;
    try {
        await deleteUser(id);
        return res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user: ', error);
        return res.status(500).json({ message: 'Failed to delete user' });
    }
};
export const registerUser = async (req, res) => {
    console.log('Register route hit with body:', req.body);
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
export const handleUserUpdate = async (req, res) => {
    const { id } = req.params;
    try {
        const updates = req.body;
        // Call the model to update the user
        await applyUserUpdate(id, updates);
        return res.status(200).json({ message: 'User updated successfully' });
    }
    catch (error) {
        return res
            .status(400)
            .json({ message: `Failed to update user with id: ${id}` });
    }
};
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const isValidUser = await verifyUserCredentials(email, password);
        if (isValidUser) {
            const user = await findUserByEmail(email);
            if (user) {
                // Check if mobile exists before proceeding
                if (!user.mobile) {
                    return res
                        .status(400)
                        .json({ message: 'User mobile number is missing' });
                }
                // Handle OTP flow
                const otp = generateOTP();
                const otpTimestamp = new Date();
                await saveUserUpdate(user.id, { otp, otpTimestamp });
                await sendOTP(user.mobile, otp);
                return res
                    .status(200)
                    .json({ message: 'Credentials confirmed. OTP sent.' });
            }
            else {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
        }
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};
export const verifyLogin = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Ensure the OTP and otpTimestamp exist
        if (!user.otp || !user.otpTimestamp) {
            return res.status(400).json({ message: 'OTP not sent or expired' });
        }
        // Check if the OTP matches and hasn't expired (5 minutes limit)
        const currentTime = new Date();
        const otpExpirationTime = new Date(user.otpTimestamp);
        otpExpirationTime.setMinutes(otpExpirationTime.getMinutes() + 5);
        if (user.otp === otp) {
            if (currentTime <= otpExpirationTime) {
                // OTP is valid, clear the OTP and timestamp from the DB
                await saveUserUpdate(user.id, { otp: null, otpTimestamp: null });
                return res.status(200).json({ message: 'Login successful' });
            }
            else {
                return res.status(401).json({ message: 'OTP has expired' });
            }
        }
        else {
            return res.status(401).json({ message: 'Invalid OTP' });
        }
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};
export const test = async (req, res) => {
    return res.status(201).json({ message: 'App is healthy' });
};
