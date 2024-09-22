export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  password: string;
  otp?: string | null;
  otpTimestamp?: Date | null;
  isLoginVerified: boolean;
  isPasswordChangeEligible?: boolean;
  passwordChangeOtp?: string | null;
  passwordChangeOtpTimestamp?: Date | null;
}

export interface Data {
  users: User[];
}
