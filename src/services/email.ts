import nodemailer from "nodemailer";

const password = process.env.GMAIL_PASSWORD;
const email = process.env.GMAIL_USER;

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass: password,
  },
});
