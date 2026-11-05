/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

function readVersionFile(): string {
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const candidates = [
      resolve(__dirname, "..", "..", "VERSION"),
      resolve(process.cwd(), "VERSION"),
    ];
    for (const p of candidates) {
      if (existsSync(p)) {
        return readFileSync(p, "utf-8").trim();
      }
    }
    return "1.0.0";
  } catch {
    return "1.0.0";
  }
}

export const BOTFIZZ_PRODUCT_NAME = "Botfizz";
export const BOTFIZZ_VERSION = readVersionFile();
export const BOTFIZZ_AUTHOR = "Hanzala Zaheer & Waleed Shams";
export const BOTFIZZ_WEBSITE = "https://botfizz.com";
export const BOTFIZZ_SUPPORT_EMAIL = "support@botfizz.com";
export const BOTFIZZ_SUPPORT_URL = "https://botfizz.com/support";
export const BOTFIZZ_LICENSE = "Proprietary — All Rights Reserved";

export const BOTFIZZ_POWERED_BY = `${BOTFIZZ_PRODUCT_NAME} v${BOTFIZZ_VERSION}`;
export const BOTFIZZ_HEADER_KEY = "X-Powered-By";
export const BOTFIZZ_HEADER_VALUE = BOTFIZZ_POWERED_BY;

export const BOTFIZZ_BRAND = {
  name: BOTFIZZ_PRODUCT_NAME,
  version: BOTFIZZ_VERSION,
  author: BOTFIZZ_AUTHOR,
  website: BOTFIZZ_WEBSITE,
  support: BOTFIZZ_SUPPORT_EMAIL,
  license: BOTFIZZ_LICENSE,
} as const;




export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
