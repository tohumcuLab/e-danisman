// Email service provider interface
export interface IEmailService {
  sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean>;
}

// Mock Email Service for the current environment since there's no SMTP configured
export class MockEmailService implements IEmailService {
  async sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
    console.log(`[EMAIL MOCK] Email sent to: ${to}`);
    console.log(`[EMAIL MOCK] Subject: ${subject}`);
    // console.log(`[EMAIL MOCK] Content: ${htmlContent}`);
    return true; // Pretend we sent it
  }
}

// SMTP Email Service (Skeleton)
export class SmtpEmailService implements IEmailService {
  async sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
    console.log(`[SmtpEmailService] Sending email to: ${to}`);
    // TODO: Gerçek entegrasyon için nodemailer veya benzeri bir paket kullanın.
    // const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: ... });
    // await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, html: htmlContent });
    
    console.warn("SmtpEmailService henüz tam olarak yapılandırılmadı.");
    throw new Error("SmtpEmailService functionality is not yet fully configured.");
  }
}

// Email Factory: .env üzerinden sağlayıcı seçimi
const getEmailService = (): IEmailService => {
  const provider = process.env.EMAIL_PROVIDER || "mock";
  
  if (provider === "smtp") {
    return new SmtpEmailService();
  }
  
  // Varsayılan sağlayıcı: Mock (Sadece konsola yazar)
  return new MockEmailService();
};

// Singleton export
export const emailService: IEmailService = getEmailService();
