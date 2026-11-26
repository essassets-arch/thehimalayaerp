import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../database/prisma.service';
import { BackupArtifact } from './backup-engine.service';

export interface EmailDeliveryResult {
  recipientEmail: string;
  recipientId?: string;
  status: 'SENT' | 'FAILED';
  messageId?: string;
  partsDelivered: number;
  partsTotal: number;
  errorMessage?: string;
}

@Injectable()
export class BackupEmailService {
  private readonly logger = new Logger(BackupEmailService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Builds a Nodemailer transporter using environment variables or database config.
   */
  private async getTransporter(): Promise<{
    transporter: nodemailer.Transporter | null;
    fromAddress: string;
    configured: boolean;
  }> {
    const config = await (this.prisma as any).backupConfig.findUnique({
      where: { key: 'default' },
    });

    const host = process.env.BACKUP_SMTP_HOST || process.env.SMTP_HOST || config?.smtpHost;
    const port = parseInt(
      process.env.BACKUP_SMTP_PORT || process.env.SMTP_PORT || String(config?.smtpPort || '587'),
      10,
    );
    const secure =
      process.env.BACKUP_SMTP_SECURE === 'true' ||
      process.env.SMTP_SECURE === 'true' ||
      config?.smtpSecure === true ||
      port === 465;
    const user = process.env.BACKUP_SMTP_USER || process.env.SMTP_USER || config?.smtpUser;
    const pass = process.env.BACKUP_SMTP_PASSWORD || process.env.SMTP_PASSWORD || config?.smtpPasswordEncrypted;
    const fromAddress =
      process.env.BACKUP_SMTP_FROM ||
      process.env.SMTP_FROM ||
      config?.smtpFrom ||
      'Himalaya ERP Backups <backups@himalayaerp.com>';

    if (!host || !user) {
      this.logger.warn(
        '[BackupEmail] SMTP is not fully configured. Set BACKUP_SMTP_HOST and BACKUP_SMTP_USER in .env.',
      );
      return { transporter: null, fromAddress, configured: false };
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
    });

    return { transporter, fromAddress, configured: true };
  }

  /**
   * Verifies the SMTP handshake and authentication against the configured provider.
   */
  async verifySmtpConnection(): Promise<{ success: boolean; message: string }> {
    const { transporter, configured } = await this.getTransporter();
    if (!configured || !transporter) {
      return {
        success: false,
        message: 'SMTP is not configured in server environment or database settings.',
      };
    }
    try {
      await transporter.verify();
      return {
        success: true,
        message: 'SMTP handshake and authentication succeeded with provider.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `SMTP verification failed: ${err.message || 'Connection refused'}`,
      };
    }
  }

  /**
   * Sends real encrypted backup file(s) to all active, verified recipients.
   */
  async deliverBackupToRecipients(
    backupRecordId: string,
    artifact: BackupArtifact,
  ): Promise<EmailDeliveryResult[]> {
    const { transporter, fromAddress, configured } = await this.getTransporter();

    // 1. Fetch active recipients
    const recipients = await (this.prisma as any).backupRecipient.findMany({
      where: { isActive: true },
    });

    if (recipients.length === 0) {
      this.logger.warn('[BackupEmail] No active recipients configured. Email delivery skipped.');
      return [];
    }

    if (!configured || !transporter) {
      this.logger.error('[BackupEmail] Cannot deliver backups: SMTP is unconfigured.');
      const results: EmailDeliveryResult[] = [];
      for (const r of recipients) {
        const failure: EmailDeliveryResult = {
          recipientEmail: r.email,
          recipientId: r.id,
          status: 'FAILED',
          partsDelivered: 0,
          partsTotal: artifact.chunksCount,
          errorMessage: 'SMTP service not configured in server environment (missing SMTP_HOST/USER).',
        };
        await this.recordDelivery(backupRecordId, failure);
        results.push(failure);
      }
      return results;
    }

    const nowStr = new Date().toLocaleDateString('en-GB', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const nowTimeStr = new Date().toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const subject = `Himalaya ERP – Daily PostgreSQL Backup – ${nowStr}`;
    const sizeMb = (artifact.sizeBytes / (1024 * 1024)).toFixed(2);

    // Build attachments array
    const attachments: Array<{ filename: string; path: string }> = [];
    if (artifact.parts && artifact.parts.length > 0) {
      for (const p of artifact.parts) {
        attachments.push({ filename: p.filename, path: p.filePath });
      }
    } else {
      attachments.push({ filename: artifact.filename, path: artifact.archivePath });
    }

    // Always attach the reproducible recovery manifest.json
    if (artifact.manifestPath && fs.existsSync(artifact.manifestPath)) {
      attachments.push({ filename: 'manifest.json', path: artifact.manifestPath });
    }

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 20px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px;">Himalaya ERP — Automated Database Backup</h2>
          <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px;">Confidential & Encrypted Daily Recovery Point</p>
        </div>
        <div style="padding: 24px;">
          <p>Dear Administrator,</p>
          <p>The daily scheduled PostgreSQL database backup for <strong>Himalaya ERP</strong> was generated and cryptographically verified.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Execution ID:</td>
              <td style="padding: 8px 0; font-family: monospace; color: #0f172a;">${artifact.executionId}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Backup Date & Time:</td>
              <td style="padding: 8px 0;">${nowStr} at ${nowTimeStr} (IST)</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Backup Type:</td>
              <td style="padding: 8px 0;">Full Database Backup</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Database Format:</td>
              <td style="padding: 8px 0;">PostgreSQL Custom Format (-Fc)</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Encryption:</td>
              <td style="padding: 8px 0;"><span style="background-color: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-weight: bold;">AES-256-GCM (Auth Tag Verified)</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Integrity Verification:</td>
              <td style="padding: 8px 0;"><span style="background-color: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-weight: bold;">Successful</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Archive Size:</td>
              <td style="padding: 8px 0;"><strong>${sizeMb} MB</strong> (${artifact.sizeBytes.toLocaleString()} bytes)</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Attachment Parts:</td>
              <td style="padding: 8px 0;">${artifact.chunksCount} part(s)</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Recovery Point:</td>
              <td style="padding: 8px 0;">Previous night's verified backup</td>
            </tr>
          </table>

          <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 12px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 12px; color: #475569; word-break: break-all;">
              <strong>SHA-256 Checksum:</strong><br/>
              <span style="font-family: monospace;">${artifact.checksumSha256}</span>
            </p>
          </div>

          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 13px; color: #92400e;">
              <strong>Security Notice:</strong> The encrypted backup file is attached to this email. For security and air-gap protection, the AES-256 decryption key is maintained separately in your server environment secret manager and is <em>never</em> sent with backup emails.
            </p>
          </div>

          <p style="font-size: 12px; color: #94a3b8; margin-top: 30px; text-align: center;">
            This is an automated system email generated by Himalaya ERP Production Command Center.<br/>
            Himalaya FRP & Construction Products • Vadodara, Gujarat
          </p>
        </div>
      </div>
    `;

    const results: EmailDeliveryResult[] = [];

    for (const recipient of recipients) {
      let attempts = 0;
      let sentSuccess = false;
      let lastError = '';
      let messageId = '';

      while (attempts < 3 && !sentSuccess) {
        attempts++;
        try {
          this.logger.log(
            `[BackupEmail] Attempt ${attempts}/3: Sending backup attachment to ${recipient.email}...`,
          );
          const info = await transporter.sendMail({
            from: fromAddress,
            to: recipient.email,
            subject,
            html: htmlBody,
            attachments,
          });

          sentSuccess = true;
          messageId = info.messageId || `msg_${Date.now()}`;
          this.logger.log(`[BackupEmail] Email sent to ${recipient.email} (Message-ID: ${messageId})`);
        } catch (err: any) {
          lastError = err?.message || 'SMTP transmission failure';
          this.logger.warn(
            `[BackupEmail] Attempt ${attempts} failed for ${recipient.email}: ${lastError}`,
          );
          if (attempts < 3) {
            // Wait 2s before retry
            await new Promise((res) => setTimeout(res, 2000));
          }
        }
      }

      const result: EmailDeliveryResult = {
        recipientEmail: recipient.email,
        recipientId: recipient.id,
        status: sentSuccess ? 'SENT' : 'FAILED',
        messageId: sentSuccess ? messageId : undefined,
        partsDelivered: sentSuccess ? artifact.chunksCount : 0,
        partsTotal: artifact.chunksCount,
        errorMessage: sentSuccess ? undefined : lastError,
      };

      await this.recordDelivery(backupRecordId, result);
      results.push(result);

      if (sentSuccess) {
        // Update recipient lastDeliveredAt
        await (this.prisma as any).backupRecipient.update({
          where: { id: recipient.id },
          data: { lastDeliveredAt: new Date() },
        });
      }
    }

    return results;
  }

  /**
   * Sends an instant verification test email to a recipient.
   */
  async sendTestEmail(targetEmail: string): Promise<{ success: boolean; message: string }> {
    const { transporter, fromAddress, configured } = await this.getTransporter();

    if (!configured || !transporter) {
      return {
        success: false,
        message: 'SMTP is not configured yet. Please configure your SMTP Host, User, and Password in the "Configuration & Automation" tab or in server environment variables.',
      };
    }

    try {
      const nowStr = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });
      await transporter.sendMail({
        from: fromAddress,
        to: targetEmail,
        subject: `Himalaya ERP – Backup Notification Test Email`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
            <h3 style="color: #0f172a; margin-top: 0;">Backup Delivery Verification</h3>
            <p>Hello,</p>
            <p>This is a test notification from the <strong>Himalaya ERP Super Admin Database Backup Module</strong>.</p>
            <p>If you received this message, your email address is verified and ready to receive daily encrypted PostgreSQL database backups at 11:00 PM IST.</p>
            <p style="font-size: 12px; color: #64748b;">Timestamp: ${nowStr} (IST)</p>
          </div>
        `,
      });

      return {
        success: true,
        message: `Test email successfully dispatched to ${targetEmail}. Please check your inbox.`,
      };
    } catch (err: any) {
      this.logger.error(`[BackupEmail] Test email to ${targetEmail} failed: ${err?.message}`);
      return {
        success: false,
        message: `SMTP connection failed: ${err?.message}`,
      };
    }
  }

  /**
   * Records email delivery status in backup_delivery_histories.
   */
  private async recordDelivery(backupId: string, result: EmailDeliveryResult) {
    try {
      await (this.prisma as any).backupDeliveryHistory.create({
        data: {
          backupId,
          recipientEmail: result.recipientEmail,
          recipientId: result.recipientId,
          status: result.status,
          partsDelivered: result.partsDelivered,
          partsTotal: result.partsTotal,
          messageId: result.messageId,
          sentAt: result.status === 'SENT' ? new Date() : null,
          errorMessage: result.errorMessage,
        },
      });
    } catch (err: any) {
      this.logger.error(`[BackupEmail] Failed to record delivery history: ${err?.message}`);
    }
  }
}
