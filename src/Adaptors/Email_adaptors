import nodemailer from "nodemailer";
import type { SendMailOptions, Transporter } from "nodemailer";

/**
 * Adapter Pattern for Email Services
 * Allows switching between different email providers without changing business logic
 * Provides a unified interface for sending emails
 */

/**
 * Email Adapter Interface
 * All email providers must implement this interface
 */
export interface EmailAdapter {
  sendEmail(options: SendMailOptions): Promise<EmailResult>;
  initialize(): Promise<void>;
  getProviderName(): string;
}

/**
 * Email Result Interface
 */
export interface EmailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

/**
 * Ethereal Email Adapter (for testing)
 */
export class EtherealAdapter implements EmailAdapter {
  private transporter: Transporter | null = null;

  getProviderName(): string {
    return "Ethereal (Test)";
  }

  async initialize(): Promise<void> {
    if (!this.transporter) {
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      console.log(`✉️  ${this.getProviderName()} adapter initialized`);
      console.log(`   User: ${testAccount.user}`);
    }
  }

  async sendEmail(options: SendMailOptions): Promise<EmailResult> {
    try {
      await this.initialize();

      if (!this.transporter) {
        throw new Error("Transporter not initialized");
      }

      const info = await this.transporter.sendMail(options);
      const previewUrl = nodemailer.getTestMessageUrl(info);

      console.log(`📧 Email sent via ${this.getProviderName()}`);
      console.log(`   To: ${options.to}`);
      console.log(`   Preview: ${previewUrl}`);

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl || undefined,
      };
    } catch (error) {
      console.error(`❌ Failed to send email via ${this.getProviderName()}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

/**
 * SendGrid Email Adapter (for production)
 * Note: Requires @sendgrid/mail package and API key
 */
export class SendGridAdapter implements EmailAdapter {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SENDGRID_API_KEY || "";
  }

  getProviderName(): string {
    return "SendGrid";
  }

  async initialize(): Promise<void> {
    if (!this.apiKey) {
      throw new Error("SendGrid API key not configured");
    }
    console.log(`✉️  ${this.getProviderName()} adapter initialized`);
  }

  async sendEmail(options: SendMailOptions): Promise<EmailResult> {
    try {
      await this.initialize();

      // This is a placeholder - actual SendGrid implementation would use @sendgrid/mail
      // import sgMail from '@sendgrid/mail';
      // sgMail.setApiKey(this.apiKey);
      // const msg = { ... };
      // const response = await sgMail.send(msg);

      console.log(`📧 Email would be sent via ${this.getProviderName()}`);
      console.log(`   To: ${options.to}`);
      console.log(`   Note: SendGrid adapter is a placeholder - install @sendgrid/mail to use`);

      return {
        success: true,
        messageId: `sendgrid-${Date.now()}`,
      };
    } catch (error) {
      console.error(`❌ Failed to send email via ${this.getProviderName()}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

/**
 * AWS SES Email Adapter (for production)
 * Note: Requires AWS SDK and credentials
 */
export class AWSEmailAdapter implements EmailAdapter {
  private region: string;

  constructor(region?: string) {
    this.region = region || process.env.AWS_REGION || "us-east-1";
  }

  getProviderName(): string {
    return "AWS SES";
  }

  async initialize(): Promise<void> {
    console.log(`✉️  ${this.getProviderName()} adapter initialized (region: ${this.region})`);
  }

  async sendEmail(options: SendMailOptions): Promise<EmailResult> {
    try {
      await this.initialize();

      // This is a placeholder - actual AWS SES implementation would use AWS SDK
      // import { SES } from '@aws-sdk/client-ses';
      // const ses = new SES({ region: this.region });
      // const response = await ses.sendEmail({ ... });

      console.log(`📧 Email would be sent via ${this.getProviderName()}`);
      console.log(`   To: ${options.to}`);
      console.log(`   Note: AWS SES adapter is a placeholder - configure AWS SDK to use`);

      return {
        success: true,
        messageId: `aws-${Date.now()}`,
      };
    } catch (error) {
      console.error(`❌ Failed to send email via ${this.getProviderName()}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

/**
 * SMTP Email Adapter (generic SMTP server)
 */
export class SMTPAdapter implements EmailAdapter {
  private transporter: Transporter | null = null;
  private config: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };

  constructor(config: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  }) {
    this.config = {
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    };
  }

  getProviderName(): string {
    return `SMTP (${this.config.host})`;
  }

  async initialize(): Promise<void> {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport(this.config);
      console.log(`✉️  ${this.getProviderName()} adapter initialized`);
    }
  }

  async sendEmail(options: SendMailOptions): Promise<EmailResult> {
    try {
      await this.initialize();

      if (!this.transporter) {
        throw new Error("Transporter not initialized");
      }

      const info = await this.transporter.sendMail(options);

      console.log(`📧 Email sent via ${this.getProviderName()}`);
      console.log(`   To: ${options.to}`);
      console.log(`   Message ID: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error(`❌ Failed to send email via ${this.getProviderName()}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

/**
 * Email Service with Adapter Pattern
 * Uses the configured adapter to send emails
 */
export class EmailService {
  private adapter: EmailAdapter;

  constructor(adapter: EmailAdapter) {
    this.adapter = adapter;
  }

  /**
   * Switch to a different email adapter
   */
  setAdapter(adapter: EmailAdapter): void {
    this.adapter = adapter;
    console.log(`📬 Switched to ${adapter.getProviderName()} email provider`);
  }

  /**
   * Send email using the current adapter
   */
  async send(options: SendMailOptions): Promise<EmailResult> {
    return await this.adapter.sendEmail(options);
  }

  /**
   * Get current provider name
   */
  getProviderName(): string {
    return this.adapter.getProviderName();
  }
}

/**
 * Factory function to create email service based on environment
 */
export function createEmailService(): EmailService {
  const provider = process.env.EMAIL_PROVIDER || "ethereal";

  let adapter: EmailAdapter;

  switch (provider.toLowerCase()) {
    case "sendgrid":
      adapter = new SendGridAdapter(process.env.SENDGRID_API_KEY);
      break;
    
    case "aws":
    case "ses":
      adapter = new AWSEmailAdapter(process.env.AWS_REGION);
      break;
    
    case "smtp":
      if (!process.env.SMTP_HOST) {
        console.warn("SMTP configuration missing, falling back to Ethereal");
        adapter = new EtherealAdapter();
      } else {
        adapter = new SMTPAdapter({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_SECURE === "true",
          user: process.env.SMTP_USER || "",
          pass: process.env.SMTP_PASS || "",
        });
      }
      break;
    
    case "ethereal":
    default:
      adapter = new EtherealAdapter();
      break;
  }

  console.log(`📮 Email service initialized with ${adapter.getProviderName()}`);
  
  return new EmailService(adapter);
}
