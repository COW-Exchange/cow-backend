import { NotFoundError } from "../helpers/apiError";
import User, { UserDocument } from "../models/User";

const createUserService = async (user: UserDocument) => {
  return await user.save();
};

const findUserById = async (id: string): Promise<UserDocument> => {
  const foundUser = await User.findOne({ id: id }).select(
    "id selectedCurrencies ownCurrencies baseCurrency timeFrame"
  );
  if (!foundUser) {
    throw new NotFoundError(`User ${id} not found`);
  }
  return foundUser;
};

const updateUser = async (
  userId: string,
  update: Partial<UserDocument>
): Promise<UserDocument> => {
  const foundUser = await User.findByIdAndUpdate(userId, update, {
    new: true,
  });

  if (!foundUser) {
    throw new NotFoundError(`User ${userId} not found`);
  }
  return foundUser;
};

export default {
  createUserService,
  findUserById,
  updateUser,
};
