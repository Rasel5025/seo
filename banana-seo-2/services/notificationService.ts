/**
 * Handles system notifications for critical user actions.
 * In a full production environment, this would interface with a backend email provider (e.g. SendGrid, AWS SES).
 */
export const notificationService = {
  /**
   * Sends a security notification email upon new login.
   * This is a notification only and does not contain sensitive credentials.
   */
  sendLoginNotification: async (email: string): Promise<boolean> => {
    // Simulate API network latency
    await new Promise(resolve => setTimeout(resolve, 800));

    // In a real implementation: await fetch('/api/notify/login', { method: 'POST', body: JSON.stringify({ email }) });
    console.group('📧 Banana SEO - Security Notification');
    console.log(`To: ${email}`);
    console.log(`Subject: New Login Detected – Banana SEO`);
    console.log(`Timestamp: ${new Date().toLocaleString()}`);
    console.log(`Message: We detected a new login to your account. If this was you, no action is needed.`);
    console.groupEnd();

    return true;
  }
};