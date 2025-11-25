import nodemailer from "nodemailer";
import { TransactionalEmailsApi, SendSmtpEmail } from "@getbrevo/brevo";

let transporter;

// Gmail SMTP in development
if (process.env.NODE_ENV !== "production") {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// Brevo API client in production
let brevoClient;
if (process.env.NODE_ENV === "production") {
  brevoClient = new TransactionalEmailsApi();
  brevoClient.authentications.apiKey.apiKey = process.env.BREVO_API_KEY;
}

export const sendEmail = async (to, subject, html, name = "user") => {
  if (process.env.NODE_ENV === "production") {
    const message = new SendSmtpEmail();
    message.sender = { email: process.env.EMAIL_FROM };
    message.to = [{ email: to, name }];
    message.subject = subject;
    message.htmlContent = html;

    try {
      const res = await brevoClient.sendTransacEmail(message);
      console.log("Email sent:", res.body);
      return res.body;
    } catch (err) {
      console.error("Error sending email via Brevo API:", err);
      throw err;
    }
  } else {
    // Local dev using Gmail SMTP
    return transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  }
};
