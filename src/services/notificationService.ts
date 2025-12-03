/**
 * Notification Service
 *
 * Manages in-app and email notifications for users
 * In production, this would integrate with email service (SendGrid, AWS SES, etc.)
 */

export enum NotificationType {
  USAGE_LIMIT_WARNING = 'usage_limit_warning',
  USAGE_LIMIT_REACHED = 'usage_limit_reached',
  SUBSCRIPTION_RENEWED = 'subscription_renewed',
  SUBSCRIPTION_CANCELED = 'subscription_canceled',
  SUBSCRIPTION_EXPIRING = 'subscription_expiring',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_SUCCESS = 'payment_success',
  FEATURE_ANNOUNCEMENT = 'feature_announcement',
  TIPS_AND_TRICKS = 'tips_and_tricks'
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: number;
  expiresAt?: number;
}

export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  body: string;
  type: NotificationType;
  status: 'queued' | 'sent' | 'failed';
  createdAt: number;
  sentAt?: number;
}

const NOTIFICATIONS_KEY = 'genius_writer_notifications';
const EMAIL_QUEUE_KEY = 'genius_writer_email_queue';

/**
 * Create in-app notification
 */
export function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  options?: {
    priority?: Notification['priority'];
    actionUrl?: string;
    actionLabel?: string;
    expiresInDays?: number;
  }
): Notification {
  const notification: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type,
    title,
    message,
    priority: options?.priority || 'medium',
    read: false,
    actionUrl: options?.actionUrl,
    actionLabel: options?.actionLabel,
    createdAt: Date.now(),
    expiresAt: options?.expiresInDays
      ? Date.now() + (options.expiresInDays * 24 * 60 * 60 * 1000)
      : undefined
  };

  saveNotification(notification);
  return notification;
}

/**
 * Get all notifications for user
 */
export function getNotifications(userId: string, includeRead: boolean = false): Notification[] {
  try {
    const stored = localStorage.getItem(`${NOTIFICATIONS_KEY}_${userId}`);
    if (!stored) return [];

    let notifications: Notification[] = JSON.parse(stored);

    // Filter expired
    const now = Date.now();
    notifications = notifications.filter(n => !n.expiresAt || n.expiresAt > now);

    // Filter read if requested
    if (!includeRead) {
      notifications = notifications.filter(n => !n.read);
    }

    return notifications.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

/**
 * Mark notification as read
 */
export function markAsRead(userId: string, notificationId: string): void {
  const notifications = getAllNotifications(userId);
  const notification = notifications.find(n => n.id === notificationId);

  if (notification) {
    notification.read = true;
    saveAllNotifications(userId, notifications);
  }
}

/**
 * Mark all as read
 */
export function markAllAsRead(userId: string): void {
  const notifications = getAllNotifications(userId);
  notifications.forEach(n => n.read = true);
  saveAllNotifications(userId, notifications);
}

/**
 * Delete notification
 */
export function deleteNotification(userId: string, notificationId: string): void {
  const notifications = getAllNotifications(userId);
  const filtered = notifications.filter(n => n.id !== notificationId);
  saveAllNotifications(userId, filtered);
}

/**
 * Get unread count
 */
export function getUnreadCount(userId: string): number {
  return getNotifications(userId, false).length;
}

/**
 * Save notification
 */
function saveNotification(notification: Notification): void {
  try {
    const notifications = getAllNotifications(notification.userId);
    notifications.push(notification);

    // Keep only last 50 notifications
    const limited = notifications.slice(-50);

    localStorage.setItem(`${NOTIFICATIONS_KEY}_${notification.userId}`, JSON.stringify(limited));
  } catch (error) {
    console.error('Failed to save notification:', error);
  }
}

/**
 * Get all notifications (including read)
 */
function getAllNotifications(userId: string): Notification[] {
  try {
    const stored = localStorage.getItem(`${NOTIFICATIONS_KEY}_${userId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save all notifications
 */
function saveAllNotifications(userId: string, notifications: Notification[]): void {
  try {
    localStorage.setItem(`${NOTIFICATIONS_KEY}_${userId}`, JSON.stringify(notifications));
  } catch (error) {
    console.error('Failed to save notifications:', error);
  }
}

/**
 * Queue email notification
 * In production, this would send to backend API which handles actual email sending
 */
export function queueEmail(
  to: string,
  subject: string,
  body: string,
  type: NotificationType
): EmailNotification {
  const email: EmailNotification = {
    id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    to,
    subject,
    body,
    type,
    status: 'queued',
    createdAt: Date.now()
  };

  saveEmailToQueue(email);
  return email;
}

/**
 * Save email to queue
 */
function saveEmailToQueue(email: EmailNotification): void {
  try {
    const queue = getEmailQueue();
    queue.push(email);

    // Keep only last 100 emails
    const limited = queue.slice(-100);

    localStorage.setItem(EMAIL_QUEUE_KEY, JSON.stringify(limited));
  } catch (error) {
    console.error('Failed to queue email:', error);
  }
}

/**
 * Get email queue
 */
function getEmailQueue(): EmailNotification[] {
  try {
    const stored = localStorage.getItem(EMAIL_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// =============================================================================
// PREDEFINED NOTIFICATION TEMPLATES
// =============================================================================

/**
 * Usage limit warning (80% reached)
 */
export function notifyUsageLimitWarning(userId: string, userEmail: string, limitType: string, percentage: number): void {
  createNotification(
    userId,
    NotificationType.USAGE_LIMIT_WARNING,
    `${limitType} limit ${percentage}% reached`,
    `You've used ${percentage}% of your monthly ${limitType} limit. Consider upgrading your plan.`,
    {
      priority: 'medium',
      actionUrl: '/user-dashboard?tab=billing',
      actionLabel: 'Upgrade Plan'
    }
  );

  queueEmail(
    userEmail,
    `Genius Writer: ${limitType} Limit Warning`,
    `Hi there,\n\nYou've used ${percentage}% of your monthly ${limitType} limit. To continue using Genius Writer without interruption, consider upgrading your plan.\n\nBest regards,\nGenius Writer Team`,
    NotificationType.USAGE_LIMIT_WARNING
  );
}

/**
 * Usage limit reached (100%)
 */
export function notifyUsageLimitReached(userId: string, userEmail: string, limitType: string): void {
  createNotification(
    userId,
    NotificationType.USAGE_LIMIT_REACHED,
    `${limitType} limit reached`,
    `You've reached your monthly ${limitType} limit. Upgrade now to continue.`,
    {
      priority: 'high',
      actionUrl: '/user-dashboard?tab=billing',
      actionLabel: 'Upgrade Now'
    }
  );

  queueEmail(
    userEmail,
    `Genius Writer: ${limitType} Limit Reached`,
    `Hi there,\n\nYou've reached your monthly ${limitType} limit. To continue using Genius Writer, please upgrade your plan.\n\nUpgrade now: [Billing Dashboard]\n\nBest regards,\nGenius Writer Team`,
    NotificationType.USAGE_LIMIT_REACHED
  );
}

/**
 * Subscription renewed
 */
export function notifySubscriptionRenewed(userId: string, userEmail: string, planName: string, amount: number): void {
  createNotification(
    userId,
    NotificationType.SUBSCRIPTION_RENEWED,
    'Subscription renewed',
    `Your ${planName} plan has been renewed for $${amount}.`,
    {
      priority: 'low',
      actionUrl: '/user-dashboard?tab=billing',
      actionLabel: 'View Invoice'
    }
  );

  queueEmail(
    userEmail,
    'Genius Writer: Subscription Renewed',
    `Hi there,\n\nYour ${planName} subscription has been successfully renewed for $${amount}.\n\nView your invoice: [Billing Dashboard]\n\nThank you for being a valued customer!\n\nBest regards,\nGenius Writer Team`,
    NotificationType.SUBSCRIPTION_RENEWED
  );
}

/**
 * Subscription canceled
 */
export function notifySubscriptionCanceled(userId: string, userEmail: string, endDate: string): void {
  createNotification(
    userId,
    NotificationType.SUBSCRIPTION_CANCELED,
    'Subscription canceled',
    `Your subscription will end on ${endDate}. You can reactivate anytime.`,
    {
      priority: 'medium',
      actionUrl: '/user-dashboard?tab=billing',
      actionLabel: 'Reactivate'
    }
  );

  queueEmail(
    userEmail,
    'Genius Writer: Subscription Canceled',
    `Hi there,\n\nWe're sorry to see you go! Your subscription will remain active until ${endDate}.\n\nYou can reactivate anytime before then.\n\nBest regards,\nGenius Writer Team`,
    NotificationType.SUBSCRIPTION_CANCELED
  );
}

/**
 * Subscription expiring soon
 */
export function notifySubscriptionExpiring(userId: string, userEmail: string, daysLeft: number): void {
  createNotification(
    userId,
    NotificationType.SUBSCRIPTION_EXPIRING,
    'Subscription expiring soon',
    `Your subscription expires in ${daysLeft} days. Renew now to keep your access.`,
    {
      priority: 'high',
      actionUrl: '/user-dashboard?tab=billing',
      actionLabel: 'Renew Now',
      expiresInDays: daysLeft
    }
  );

  queueEmail(
    userEmail,
    'Genius Writer: Subscription Expiring Soon',
    `Hi there,\n\nYour subscription will expire in ${daysLeft} days. Don't lose access to your documents and features!\n\nRenew now: [Billing Dashboard]\n\nBest regards,\nGenius Writer Team`,
    NotificationType.SUBSCRIPTION_EXPIRING
  );
}

/**
 * Payment failed
 */
export function notifyPaymentFailed(userId: string, userEmail: string): void {
  createNotification(
    userId,
    NotificationType.PAYMENT_FAILED,
    'Payment failed',
    'We couldn\'t process your payment. Please update your payment method.',
    {
      priority: 'high',
      actionUrl: '/user-dashboard?tab=billing',
      actionLabel: 'Update Payment'
    }
  );

  queueEmail(
    userEmail,
    'Genius Writer: Payment Failed',
    `Hi there,\n\nWe couldn't process your payment. Please update your payment method to avoid service interruption.\n\nUpdate payment: [Billing Dashboard]\n\nBest regards,\nGenius Writer Team`,
    NotificationType.PAYMENT_FAILED
  );
}

/**
 * Payment successful
 */
export function notifyPaymentSuccess(userId: string, userEmail: string, amount: number): void {
  createNotification(
    userId,
    NotificationType.PAYMENT_SUCCESS,
    'Payment successful',
    `Your payment of $${amount} was processed successfully.`,
    {
      priority: 'low',
      actionUrl: '/user-dashboard?tab=billing',
      actionLabel: 'View Receipt'
    }
  );

  queueEmail(
    userEmail,
    'Genius Writer: Payment Successful',
    `Hi there,\n\nYour payment of $${amount} was processed successfully.\n\nView receipt: [Billing Dashboard]\n\nThank you!\n\nBest regards,\nGenius Writer Team`,
    NotificationType.PAYMENT_SUCCESS
  );
}

export default {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  queueEmail,
  notifyUsageLimitWarning,
  notifyUsageLimitReached,
  notifySubscriptionRenewed,
  notifySubscriptionCanceled,
  notifySubscriptionExpiring,
  notifyPaymentFailed,
  notifyPaymentSuccess
};
