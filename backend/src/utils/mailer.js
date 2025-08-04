import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "live.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: "apismtp@mailtrap.io",
    pass: "495ec9162e2eeac3a55baf2fead3169a",
  },
});

export async function sendMail({ to, subject, html }) {
  return transporter.sendMail({
    from: "no-reply@meeteasy.com",
    to,
    subject,
    html,
  });
}
