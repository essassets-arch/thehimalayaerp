import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getMessaging, MulticastMessage } from 'firebase-admin/messaging';
import { PrismaService } from '../../database/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebasePushService implements OnModuleInit {
  private readonly logger = new Logger(FirebasePushService.name);
  private firebaseApp: App | null = null;
  private isConfigured = false;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.initFirebase();
  }

  private initFirebase() {
    try {
      const existingApps = getApps();
      if (existingApps.length > 0) {
        this.firebaseApp = existingApps[0]!;
        this.isConfigured = true;
        return;
      }

      let credentialObj: any = null;

      // 1. Check if FIREBASE_SERVICE_ACCOUNT_JSON environment variable is provided
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        try {
          credentialObj = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
          this.logger.log('Loaded Firebase Admin credential from FIREBASE_SERVICE_ACCOUNT_JSON env var.');
        } catch (e: any) {
          this.logger.error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: ${e.message}`);
        }
      }

      // 2. Check if FIREBASE_SERVICE_ACCOUNT_PATH file path is provided or exists locally
      if (!credentialObj) {
        const saPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'firebase-service-account.json';
        const absolutePath = path.isAbsolute(saPath) ? saPath : path.join(process.cwd(), saPath);
        if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
          try {
            const fileContent = fs.readFileSync(absolutePath, 'utf8');
            credentialObj = JSON.parse(fileContent);
            this.logger.log(`Loaded Firebase Admin credential from file: ${absolutePath}`);
          } catch (e: any) {
            this.logger.warn(`Could not parse Firebase service account file at ${absolutePath}: ${e.message}`);
          }
        }
      }

      // 3. Fallback to individual env vars (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
      if (!credentialObj) {
        const projectId = process.env.FIREBASE_PROJECT_ID || 'himalaya-c9d06';
        let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (clientEmail === '""' || clientEmail === "''") clientEmail = '';
        if (privateKey === '""' || privateKey === "''") privateKey = '';

        if (clientEmail && privateKey) {
          if (privateKey.includes('\\n')) {
            privateKey = privateKey.replace(/\\n/g, '\n');
          }
          credentialObj = {
            projectId,
            clientEmail,
            privateKey,
          };
        }
      }

      if (!credentialObj) {
        this.logger.log('Firebase push credentials missing. FCM push disabled; DB notifications remain fully functional.');
        this.isConfigured = false;
        return;
      }

      this.firebaseApp = initializeApp({
        credential: cert(credentialObj),
      });

      this.isConfigured = true;
      this.logger.log(`Firebase Admin SDK initialized successfully for project: ${credentialObj.project_id || credentialObj.projectId || 'himalaya-c9d06'}`);
    } catch (err: any) {
      this.logger.error(`Failed to initialize Firebase Admin SDK: ${err?.message || err}`);
      this.isConfigured = false;
    }
  }

  async sendPushToUser(
    userId: string,
    companyId: string,
    title: string,
    body: string,
    data: Record<string, string> = {},
  ): Promise<void> {
    if (!this.isConfigured || !this.firebaseApp) {
      return;
    }

    try {
      const deviceTokens = await this.prisma.fcmDeviceToken.findMany({
        where: { userId, companyId },
        select: { id: true, token: true },
      });

      if (deviceTokens.length === 0) {
        return;
      }

      const tokens = deviceTokens.map((t) => t.token);

      const stringData: Record<string, string> = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null) {
          stringData[key] = String(value);
        }
      }

      const message: MulticastMessage = {
        notification: {
          title,
          body,
        },
        data: stringData,
        tokens,
      };

      const response = await getMessaging(this.firebaseApp).sendEachForMulticast(message);

      const invalidTokens: string[] = [];
      response.responses.forEach((resp, index) => {
        if (!resp.success && resp.error) {
          const errorCode = resp.error.code;
          if (
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.push(tokens[index]);
          } else {
            this.logger.warn(`FCM delivery error for token index ${index}: ${resp.error.message}`);
          }
        }
      });

      if (invalidTokens.length > 0) {
        this.logger.log(`Cleaning up ${invalidTokens.length} expired FCM token(s)...`);
        await this.prisma.fcmDeviceToken.deleteMany({
          where: { token: { in: invalidTokens } },
        });
      }
    } catch (err: any) {
      this.logger.error(`Error delivering FCM push to user ${userId}: ${err?.message || err}`);
    }
  }
}
