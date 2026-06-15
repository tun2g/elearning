import { Injectable, Logger } from '@nestjs/common';
import { Expo, type ExpoPushMessage } from 'expo-server-sdk';

/** Thin wrapper over the Expo Push API: validates tokens, chunks, and sends. */
@Injectable()
export class ExpoPushService {
  private readonly logger = new Logger(ExpoPushService.name);
  private readonly expo = new Expo();

  async send(messages: ExpoPushMessage[]): Promise<void> {
    const valid = messages.filter((m) => typeof m.to === 'string' && Expo.isExpoPushToken(m.to));
    if (valid.length === 0) return;

    const chunks = this.expo.chunkPushNotifications(valid);
    for (const chunk of chunks) {
      try {
        await this.expo.sendPushNotificationsAsync(chunk);
      } catch (err) {
        this.logger.error('Failed to send an Expo push chunk', err as Error);
      }
    }
    this.logger.log(`Sent ${valid.length} push notification(s)`);
  }
}
