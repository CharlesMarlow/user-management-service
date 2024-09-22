import bcrypt from 'bcrypt';
export const hashPassword = async (password) => await bcrypt.hash(password, 10);
