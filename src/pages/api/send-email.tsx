import nodemailer from "nodemailer";
import fetch from "node-fetch";
import { NextApiRequest, NextApiResponse } from "next";

// Define the shape of the reCAPTCHA response
type RecaptchaResponse = {
  success: boolean;
  score: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
};

const verifyRecaptcha = async (token: string): Promise<RecaptchaResponse> => {
  const secret = "6LcIip0qAAAAAHMGz6hC6rUVoAqUSXEYsBoMGcXk";
  const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${secret}&response=${token}`,
  });

  // Explicitly cast the response to RecaptchaResponse
  const data = (await response.json()) as RecaptchaResponse;
  return data;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { to, subject, text, recaptchaToken } = req.body;

  // Validate required fields
  if (!to || !subject || !text || !recaptchaToken) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Verify reCAPTCHA token
    const recaptchaResponse = await verifyRecaptcha(recaptchaToken);

    // Check reCAPTCHA success and score
    if (!recaptchaResponse.success || recaptchaResponse.score < 0.5) {
      return res.status(400).json({
        message: "reCAPTCHA verification failed. Please try again.",
      });
    }

    // Set up the transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587", 10), // Ensure port is a number
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send the email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Email sending failed" });
  }
}
