import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { addUser, getUserByEmailOrMobile, saveUserUpdate, } from '../db/client.js';
import { hashPassword } from '../utils.js';
export const createUser = async (name, email, mobile, password) => {
    const hashedPassword = await hashPassword(password);
    const newUser = {
        id: uuidv4(),
        name,
        email,
        mobile,
        password: hashedPassword,
        isLoginVerified: false,
    };
    await addUser(newUser);
    return newUser;
};
export const checkIfUserExists = async (email, mobile) => {
    return await getUserByEmailOrMobile(email, mobile);
};
export const applyUserUpdate = async (id, updates) => {
    await saveUserUpdate(id, updates);
};
export const verifyUserCredentials = async (user, password) => {
    if (user && (await bcrypt.compare(password, user.password))) {
        return true;
    }
    return false;
};
// Assign OTP to the user in DB
export const updateUserOTP = async (userId, otp) => {
    const otpTimestamp = new Date();
    await applyUserUpdate(userId, { otp, otpTimestamp });
};
export const validateOTP = async (user, otp, otpType) => {
    const currentTime = new Date();
    let userOtp = null;
    let userOtpTimestamp = null;
    // Check whether it's for login or password change
    if (otpType === 'login') {
        userOtp = user.otp ?? null;
        userOtpTimestamp = user.otpTimestamp ?? null;
    }
    else if (otpType === 'passwordChange') {
        userOtp = user.passwordChangeOtp ?? null;
        userOtpTimestamp = user.passwordChangeOtpTimestamp ?? null;
    }
    // Ensure OTP and timestamp exist
    if (!userOtp || !userOtpTimestamp) {
        throw new Error('OTP not sent or expired');
    }
    const otpExpirationTime = new Date(userOtpTimestamp);
    otpExpirationTime.setMinutes(otpExpirationTime.getMinutes() + 5);
    if (userOtp === otp && currentTime <= otpExpirationTime) {
        // OTP is valid, handle relevant DB updates based on type
        if (otpType === 'login') {
            await applyUserUpdate(user.id, {
                otp: null,
                otpTimestamp: null,
                isLoginVerified: true,
            });
        }
        else if (otpType === 'passwordChange') {
            await applyUserUpdate(user.id, {
                passwordChangeOtp: null,
                passwordChangeOtpTimestamp: null,
                isPasswordChangeEligible: true,
            });
        }
        return true;
    }
    if (currentTime > otpExpirationTime) {
        throw new Error('OTP has expired');
    }
    throw new Error('Invalid OTP');
};
export const handlePasswordChange = async (user, oldPassword, newPassword) => {
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        return false;
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await saveUserUpdate(user.id, { password: hashedNewPassword });
    return true;
};
export const checkIfPasswordChangeEligible = async (user) => {
    return user.isPasswordChangeEligible === true;
};
