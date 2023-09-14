import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

interface IUserMethods {
  isValidPassword(password: string): Promise<boolean>;
}

interface IUser extends Document, IUserMethods {
  email: string;
  password: string;
  favorites: Array<string>;
  recentlyViewed: Array<string>;
}


const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  favorites: {
    type: [String],
    default: [],
  },
  recentlyViewed: {
    type: [String],
    default: [],
  },
});

UserSchema.methods.isValidPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
