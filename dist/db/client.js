import { JSONFile } from 'lowdb/node';
import { Low } from 'lowdb';
// Create a LowDB instance
const defaultData = { users: [] };
const adapter = new JSONFile('./db.json');
const db = new Low(adapter, defaultData);
export const initDB = async () => {
    await db.read();
    // If no users: init with empty array
    db.data || (db.data = { users: [] });
    await db.write();
};
export const getAllUsers = async () => {
    await db.read();
    return db.data?.users || [];
};
export const findUserById = async (id) => {
    await db.read();
    return db.data?.users.find((user) => user.id === id);
};
export const deleteUser = async (id) => {
    await db.read();
    db.data.users = db.data.users.filter((user) => user.id !== id);
    console.info(`Deleted user with ID: ${id}`);
    await db.write();
};
export const addUser = async (user) => {
    await db.read();
    db.data?.users.push(user);
    await db.write();
};
export const findUserByEmail = async (email) => {
    await db.read();
    const users = db.data?.users;
    const user = users.find((user) => user.email === email);
    return user;
};
// Get user by email or mobile
export const getUserByEmailOrMobile = async (email, mobile) => {
    await db.read();
    return db.data?.users.find((user) => user.email === email || user.name === mobile);
};
// Update user (disallow mobile)
export const saveUserUpdate = async (id, updates) => {
    await db.read();
    const user = await findUserById(id);
    if (user) {
        // Only apply updates that are present in the updates object
        if (updates.name !== undefined)
            user.name = updates.name;
        if (updates.email !== undefined)
            user.email = updates.email;
        if (updates.otp !== undefined)
            user.otp = updates.otp;
        if (updates.otpTimestamp !== undefined)
            user.otpTimestamp = updates.otpTimestamp;
        if (updates.isLoginVerified !== undefined)
            user.isLoginVerified = updates.isLoginVerified;
        if (updates.isPasswordChangeEligible !== undefined)
            user.isPasswordChangeEligible = updates.isPasswordChangeEligible;
        if (updates.passwordChangeOtp !== undefined)
            user.passwordChangeOtp = updates.passwordChangeOtp;
        if (updates.passwordChangeOtpTimestamp !== undefined)
            user.passwordChangeOtpTimestamp = updates.passwordChangeOtpTimestamp;
        if (updates.password !== undefined)
            user.password = updates.password;
        await db.write();
    }
    else {
        throw new Error('User not found');
    }
};
