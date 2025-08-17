interface AuthLogData {
  action: string;
  email?: string;
  provider?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export class AuthLogger {
  private static log(level: 'info' | 'warn' | 'error', data: AuthLogData) {
    const timestamp = new Date().toISOString();
    const logMessage = {
      timestamp,
      level,
      service: 'auth',
      ...data,
    };

    // Log to console (in development) or external service (in production)
    if (process.env.NODE_ENV === 'development') {
      console[level]('[AUTH]', logMessage);
    }

    // In production, you might want to send to external logging service
    // Example: Sentry, LogRocket, or custom logging service
  }

  static info(data: AuthLogData) {
    this.log('info', data);
  }

  static warn(data: AuthLogData) {
    this.log('warn', data);
  }

  static error(data: AuthLogData) {
    this.log('error', data);
  }

  static signInAttempt(email: string, provider: string = 'credentials') {
    this.info({
      action: 'sign_in_attempt',
      email,
      provider,
    });
  }

  static signInSuccess(email: string, provider: string = 'credentials') {
    this.info({
      action: 'sign_in_success',
      email,
      provider,
    });
  }

  static signInFailure(email: string, error: string, provider: string = 'credentials') {
    this.error({
      action: 'sign_in_failure',
      email,
      provider,
      error,
    });
  }

  static signUpAttempt(email: string) {
    this.info({
      action: 'sign_up_attempt',
      email,
    });
  }

  static signUpSuccess(email: string) {
    this.info({
      action: 'sign_up_success',
      email,
    });
  }

  static signUpFailure(email: string, error: string) {
    this.error({
      action: 'sign_up_failure',
      email,
      error,
    });
  }

  static emailVerificationAttempt(email: string) {
    this.info({
      action: 'email_verification_attempt',
      email,
    });
  }

  static emailVerificationSuccess(email: string) {
    this.info({
      action: 'email_verification_success',
      email,
    });
  }

  static emailVerificationFailure(email: string, error: string) {
    this.error({
      action: 'email_verification_failure',
      email,
      error,
    });
  }

  static passwordResetRequest(email: string) {
    this.info({
      action: 'password_reset_request',
      email,
    });
  }

  static passwordResetSuccess(email: string) {
    this.info({
      action: 'password_reset_success',
      email,
    });
  }

  static passwordResetFailure(email: string, error: string) {
    this.error({
      action: 'password_reset_failure',
      email,
      error,
    });
  }
}