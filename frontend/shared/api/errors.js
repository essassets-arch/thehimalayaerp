/**
 * Custom API Error Classes for Himalaya ERP.
 */

export class ERPError extends Error {
  constructor(message, status = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthenticationError extends ERPError {
  constructor(message = 'Authentication failed.') {
    super(message, 401, 'AUTH_FAILED');
  }
}

export class PermissionError extends ERPError {
  constructor(message = 'Access Denied: Insufficient permissions.') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends ERPError {
  constructor(message = 'Resource not found.') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends ERPError {
  constructor(message = 'Resource conflict.') {
    super(message, 409, 'CONFLICT');
  }
}

export class ValidationError extends ERPError {
  constructor(message = 'Validation failed.', details = []) {
    super(message, 422, 'VALIDATION_FAILED');
    this.details = details;
  }
}

export class ServerError extends ERPError {
  constructor(message = 'An unexpected server error occurred.') {
    super(message, 500, 'SERVER_ERROR');
  }
}
