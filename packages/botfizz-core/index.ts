/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

export {
  BOTFIZZ_PRODUCT_NAME,
  BOTFIZZ_VERSION,
  BOTFIZZ_AUTHOR,
  BOTFIZZ_WEBSITE,
  BOTFIZZ_SUPPORT_EMAIL,
  BOTFIZZ_SUPPORT_URL,
  BOTFIZZ_LICENSE,
  BOTFIZZ_POWERED_BY,
  BOTFIZZ_BRAND,
  BOTFIZZ_HEADER_KEY,
  BOTFIZZ_HEADER_VALUE,
  HTTP_STATUS,
} from "./constants.js";

export {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  InternalError,
} from "./errors.js";

export { BotfizzResponse } from "./response.js";
export type { BotfizzApiResponse } from "./response.js";

export {
  cleanPhoneNumber,
  formatPhoneNumber,
  normalizePhoneNumber,
  truncateText,
  slugify,
  formatBytes,
  extractTemplateVariables,
} from "./format.js";

export {
  asyncHandler,
  validateRequired,
  validateCSVRow,
  isValidEmail,
  isValidPhoneNumber,
  sanitizeInput,
} from "./validate.js";

export { botfizzLogger } from "./logger.js";
