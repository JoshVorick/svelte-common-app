import { dev } from '$app/environment';
import { browser } from '$app/environment';

/**
 * Log levels supported by the logger
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Context information that can be attached to log entries
 */
export interface LogContext {
  /** User ID for tracking user-specific logs */
  userId?: string;
  /** Component name where the log originated */
  component?: string;
  /** Action being performed when log was created */
  action?: string;
  /** Additional metadata for the log entry */
  metadata?: Record<string, any>;
  /** Error object if logging an error */
  error?: Error;
}

/**
 * Complete log entry structure sent to logging services
 */
export interface LogEntry {
  /** ISO timestamp when log was created */
  timestamp: string;
  /** Log level */
  level: LogLevel;
  /** Log message */
  message: string;
  /** Optional context information */
  context?: LogContext;
  /** Environment where log was created */
  environment: 'development' | 'production';
  /** Client type (browser or server) */
  client: 'browser' | 'server';
}

/**
 * Centralized logger that handles console logging and external service integration
 * 
 * Features:
 * - Environment-aware logging (debug/info only in development)
 * - Browser/server detection
 * - Sentry integration for error tracking
 * - Custom logging endpoint for analytics
 * - Structured log entries with context
 * 
 * @example
 * ```typescript
 * import { logger } from '$lib/logger';
 * 
 * logger.info('User logged in', {
 *   userId: 'user123',
 *   component: 'LoginForm',
 *   action: 'login_success'
 * });
 * 
 * logger.error('Database connection failed', {
 *   component: 'Database',
 *   error: new Error('Connection timeout')
 * });
 * ```
 */
class Logger {
  /**
   * Determines if a log message should be output based on environment and log level
   * @param level - The log level to check
   * @returns True if the log should be output, false otherwise
   */
  private shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if (!dev && (level === 'debug' || level === 'info')) {
      return false;
    }
    return true;
  }

  /**
   * Creates a structured log entry with metadata
   * @param level - Log level
   * @param message - Log message
   * @param context - Optional context information
   * @returns Structured log entry
   */
  private createLogEntry(level: LogLevel, message: string, context?: LogContext): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      environment: dev ? 'development' : 'production',
      client: browser ? 'browser' : 'server'
    };
  }

  /**
   * Formats and outputs log message to console and external services
   * @param level - Log level
   * @param message - Log message
   * @param context - Optional context information
   */
  private formatMessage(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) return;

    const logEntry = this.createLogEntry(level, message, context);
    
    // Console logging
    const consoleMethod = level === 'error' ? 'error' : 
                         level === 'warn' ? 'warn' : 'log';
    
    if (context) {
      console[consoleMethod](`[${level.toUpperCase()}] ${message}`, logEntry);
    } else {
      console[consoleMethod](`[${level.toUpperCase()}] ${message}`);
    }

    // Send to external services in production
    if (!dev && browser) {
      this.sendToExternalService(logEntry);
    }
  }

  /**
   * Sends log entries to external services (Sentry, custom endpoint)
   * @param logEntry - The log entry to send
   */
  private async sendToExternalService(logEntry: LogEntry): Promise<void> {
    try {
      // Send to Sentry for errors
      if (logEntry.level === 'error' && typeof window !== 'undefined') {
        // Dynamic import to avoid SSR issues
        const sentry = await import('@sentry/sveltekit').catch(() => null);
        if (sentry) {
          if (logEntry.context?.error) {
            sentry.captureException(logEntry.context.error, { 
              extra: logEntry.context as Record<string, any>
            });
          } else {
            sentry.captureMessage(logEntry.message, 'error');
          }
        }
      }

      // Send to custom logging endpoint
      if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logEntry)
        }).catch(() => {
          // Silently fail - don't break app if logging fails
        });
      }
    } catch (error) {
      // Silently fail - logging shouldn't break the app
    }
  }

  /**
   * Logs a debug message (only in development)
   * @param message - Debug message
   * @param context - Optional context information
   */
  debug(message: string, context?: LogContext): void {
    this.formatMessage('debug', message, context);
  }

  /**
   * Logs an info message (only in development)
   * @param message - Info message
   * @param context - Optional context information
   */
  info(message: string, context?: LogContext): void {
    this.formatMessage('info', message, context);
  }

  /**
   * Logs a warning message
   * @param message - Warning message
   * @param context - Optional context information
   */
  warn(message: string, context?: LogContext): void {
    this.formatMessage('warn', message, context);
  }

  /**
   * Logs an error message and sends to Sentry
   * @param message - Error message
   * @param context - Optional context information
   */
  error(message: string, context?: LogContext): void {
    this.formatMessage('error', message, context);
  }
}

/**
 * Singleton logger instance for application-wide use
 * 
 * @example
 * ```typescript
 * import { logger } from '$lib/logger';
 * 
 * // Basic logging
 * logger.debug('Processing user request');
 * logger.info('User authenticated successfully');
 * logger.warn('Rate limit approaching');
 * logger.error('Database connection failed');
 * 
 * // With context
 * logger.error('Authentication failed', {
 *   userId: user.id,
 *   component: 'AuthService',
 *   action: 'login',
 *   metadata: { ipAddress: req.ip }
 * });
 * ```
 */
export const logger = new Logger();