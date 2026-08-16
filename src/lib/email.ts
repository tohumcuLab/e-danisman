import nodemailer from "nodemailer";

interface SendMailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendMailParams): Promise<boolean> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || `"Tarımsal e-Danışman" <noreply@hobitohum.com>`;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      await transporter.sendMail({
        from: smtpFrom,
        to,
        subject,
        html,
      });

      console.log(`[Email Sent] Message sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      console.error("[Email Error] Failed to send email via SMTP:", error);
      return false;
    }
  } else {
    console.log("==================================================");
    console.log(`[Email Simulation] To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body (HTML):\n${html}`);
    console.log("==================================================");
    return true;
  }
}
