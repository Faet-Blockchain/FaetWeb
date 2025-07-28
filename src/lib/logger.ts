
type LogLevel = 'info' | 'warn' | 'error' | 'security';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  userAgent?: string;
  ip?: string;
  extra?: Record<string, any>;
}

export class SecurityLogger {
  static log(entry: Omit<LogEntry, 'timestamp'>) {
    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    // In production, you'd send this to a logging service
    if (entry.level === 'security' || entry.level === 'error') {
      console.error('[SECURITY]', JSON.stringify(logEntry));
    } else {
      console.log(`[${entry.level.toUpperCase()}]`, JSON.stringify(logEntry));
    }
  }

  static logSecurityEvent(message: string, extra?: Record<string, any>) {
    this.log({
      level: 'security',
      message,
      extra,
    });
  }

  static logFailedAuth(ip: string, userAgent: string) {
    this.logSecurityEvent('Failed authentication attempt', {
      ip,
      userAgent,
    });
  }

  static logSuspiciousActivity(message: string, ip: string) {
    this.logSecurityEvent(`Suspicious activity: ${message}`, { ip });
  }
}
