importimport nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER || 'test@ethereal.email',
        pass: process.env.ETHEREAL_PASS || 'test123'
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<{ messageId: string; previewUrl: string }> {
    try {
      const info = await this.transporter.sendMail({
        from: '"Event App" <noreply@eventapp.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || options.text
      });

      console.log('Email sent:', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

      return {
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info) || ''
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const subject = 'Welcome to Event Management App!';
    const text = `Hello ${name},\n\nWelcome to our Event Management App! Your account has been successfully created.\n\nYou can now login and start managing your events.\n\nBest regards,\nEvent App Team`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Event Management App!</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Welcome to our Event Management App! Your account has been successfully created.</p>
        <p>You can now login and start managing your events.</p>
        <br>
        <p>Best regards,<br>Event App Team</p>
      </div>
    `;

    await this.sendEmail({ to: email, subject, text, html });
  }
}￼Enter
