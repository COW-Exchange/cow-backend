import User from "../models/User";
import bcrypt from "bcryptjs";

export const generateResetToken = async (): Promise<string> => {
  return bcrypt.genSalt(16);
};

export const setResetTokenForUser = async (
  email: string,
  resetToken: string
): Promise<boolean> => {
  const user = await User.findOne({ email });
  if (!user) {
    return false;
  }
  user.resetToken = resetToken;
  user.resetTokenExpiration = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
  await user.save();
  return true;
};

export const resetUserPassword = async (
  resetToken: string,
  newPassword: string
): Promise<boolean> => {
  const user = await User.findOne({
    resetToken,
    resetTokenExpiration: { $gt: Date.now() },
  });

  if (!user) {
    return false;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedPassword;
  user.resetToken = undefined;
  user.resetTokenExpiration = undefined;

  await user.save();

  return true;
};
