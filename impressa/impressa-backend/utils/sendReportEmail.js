import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // or use SMTP config
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendReportEmail = async ({ to, subject, text, html, attachmentPath }) => {
  const mailOptions = {
    from: '"impressa Reports" <reports@impressa.com>',
    to,
    subject,
    text,
    html,
    attachments: attachmentPath
      ? [{ filename: "report.pdf", path: attachmentPath }]
      : [],
  };

  await transporter.sendMail(mailOptions);
};

export default sendReportEmail;