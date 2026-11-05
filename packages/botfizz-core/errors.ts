/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import { HTTP_STATUS } from "./constants";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    code = "APP_ERROR"
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(HTTP_STATUS.BAD_REQUEST, message, true, "BAD_REQUEST");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(HTTP_STATUS.UNAUTHORIZED, message, true, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(HTTP_STATUS.FORBIDDEN, message, true, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(HTTP_STATUS.NOT_FOUND, message, true, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(HTTP_STATUS.CONFLICT, message, true, "CONFLICT");
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(message = "Validation failed", errors: Record<string, string[]> = {}) {
    super(HTTP_STATUS.UNPROCESSABLE, message, true, "VALIDATION_ERROR");
    this.errors = errors;
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super(HTTP_STATUS.TOO_MANY_REQUESTS, message, true, "RATE_LIMIT");
  }
}

export class InternalError extends AppError {
  constructor(message = "Internal server error") {
    super(HTTP_STATUS.INTERNAL_ERROR, message, false, "INTERNAL_ERROR");
  }
}
