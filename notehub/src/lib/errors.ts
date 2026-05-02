/**
 * Gestione errori centralizzata
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: unknown) {
    super(400, message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Autenticazione fallita') {
    super(401, message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Accesso negato') {
    super(403, message, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Risorsa non trovata') {
    super(404, message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflitto') {
    super(409, message, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Troppi richieste') {
    super(429, message, 'RATE_LIMIT');
    this.name = 'RateLimitError';
  }
}

export class ServerError extends AppError {
  constructor(message: string = 'Errore del server', public originalError?: Error) {
    super(500, message, 'SERVER_ERROR');
    this.name = 'ServerError';
  }
}

export function handleError(error: unknown) {
  console.error('[Error]', error);

  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      error: {
        code: error.code,
        message: error.message,
        ...(error instanceof ValidationError && { details: error.details }),
      },
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      error: {
        code: 'SERVER_ERROR',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Errore del server',
      },
    };
  }

  return {
    statusCode: 500,
    error: {
      code: 'SERVER_ERROR',
      message: 'Errore sconosciuto',
    },
  };
}
