// import twilio from 'twilio';
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
// const verifiedPhoneNumber = process.env.VERIFIED_PHONE_NUMBER;
// const client = twilio(accountSid, authToken);
export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
export const sendOTP = async (mobile, otp) => {
    console.log(`Mock SMS sent to ${mobile} with OTP: ${otp}`);
    return Promise.resolve();
    // try {
    //     const message = await client.messages.create({
    //         body: `Hello from user-service! Your OTP code is ${otp}`,
    //         from: twilioPhoneNumber,
    //         to: mobile,
    //     })
    // } catch (error) {
    //         console.error('Failed to send OTP:', error);
    //         throw new Error('Failed to send OTP');
    // }
};
