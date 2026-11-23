/** Default-off master switch. Must be opted into explicitly on the server. */
export const otpEnabled = () => process.env.GADDA_OTP_ENABLED === "true";
