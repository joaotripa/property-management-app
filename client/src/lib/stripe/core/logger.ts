/**
 * Structured logging utilities for subscription operations
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: string | number | boolean | null | undefined;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
}

/**
 * Structured logger for subscription operations
 */
class SubscriptionLogger {
  private context: LogContext = {};

  /**
   * Set persistent context for all logs
   */
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear persistent context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Log a message with context
   */
  private log(level: LogLevel, message: string, additionalContext?: LogContext): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.context, ...additionalContext },
    };

    const logMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    logMethod(JSON.stringify(entry));
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, {
      ...context,
      error: error?.message,
      stack: error?.stack,
    });
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, context);
    }
  }

  /**
   * Log subscription event
   */
  subscriptionEvent(
    eventType: string,
    userId: string,
    additionalContext?: LogContext
  ): void {
    this.info(`Subscription event: ${eventType}`, {
      userId,
      eventType,
      ...additionalContext,
    });
  }

  /**
   * Log webhook event
   */
  webhookEvent(
    eventType: string,
    eventId: string,
    additionalContext?: LogContext
  ): void {
    this.info(`Webhook event: ${eventType}`, {
      eventType,
      eventId,
      ...additionalContext,
    });
  }

  /**
   * Log resource limit check
   */
  resourceLimitCheck(
    userId: string,
    resourceType: string,
    currentUsage: number,
    limit: number,
    allowed: boolean
  ): void {
    this.info('Resource limit check', {
      userId,
      resourceType,
      currentUsage,
      limit,
      allowed,
      usagePercentage: limit > 0 ? Math.round((currentUsage / limit) * 100) : 0,
    });
  }

  /**
   * Log checkout session creation
   */
  checkoutSession(
    userId: string,
    plan: string,
    isYearly: boolean,
    sessionId: string
  ): void {
    this.info('Checkout session created', {
      userId,
      plan,
      isYearly,
      sessionId,
    });
  }

  /**
   * Log portal session creation
   */
  portalSession(userId: string, sessionId: string): void {
    this.info('Portal session created', {
      userId,
      sessionId,
    });
  }
}

export const logger = new SubscriptionLogger();
