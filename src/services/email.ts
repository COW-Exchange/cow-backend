import nodemailer from "nodemailer";
import User from "../models/User";

import { decipher } from "../controllers/user";

const password = process.env.MAIL_PASSWORD;
const email = process.env.MAIL_USER;

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass: password,
  },
});

export const sendNewsletter = async () => {
  const users = await User.find().select("-password");
  users.map((user) => {
    const mailOptions = {
      to: decipher(user.email),
      subject: "CowExchange Newsletter",
      html: `<p>This is sent as a test.</p>`,
    };
    transporter.sendMail(mailOptions, function (error) {
      if (error) {
        console.log(error);
      }
    });
  });
};
