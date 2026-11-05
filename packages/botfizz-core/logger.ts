/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import { BOTFIZZ_PRODUCT_NAME, BOTFIZZ_VERSION } from "./constants";

type LogLevel = "info" | "warn" | "error" | "debug" | "success";

const LOG_COLORS: Record<LogLevel, string> = {
  info: "\x1b[36m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
  debug: "\x1b[90m",
  success: "\x1b[32m",
};

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

function formatTimestamp(): string {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

function logMessage(level: LogLevel, message: string, ...args: any[]): void {
  const color = LOG_COLORS[level];
  const prefix = `${color}[${BOTFIZZ_PRODUCT_NAME}]${RESET} ${BOLD}${formatTimestamp()}${RESET} ${color}[${level.toUpperCase()}]${RESET}`;
  console.log(`${prefix} ${message}`, ...args);
}

export const botfizzLogger = {
  info: (message: string, ...args: any[]) => logMessage("info", message, ...args),
  warn: (message: string, ...args: any[]) => logMessage("warn", message, ...args),
  error: (message: string, ...args: any[]) => logMessage("error", message, ...args),
  debug: (message: string, ...args: any[]) => logMessage("debug", message, ...args),
  success: (message: string, ...args: any[]) => logMessage("success", message, ...args),

  banner: () => {
    const line = "═".repeat(52);
    console.log(`\n\x1b[36m╔${line}╗`);
    console.log(`║                                                           ║`);
    console.log(`║   ██████╗  ██████╗ ████████╗███████╗██╗███████╗███████╗   ║`);
    console.log(`║   ██╔══██╗██╔═══██╗╚══██╔══╝██╔════╝██║╚══███╔╝╚══███╔╝   ║`);
    console.log(`║   ██████╔╝██║   ██║   ██║   █████╗  ██║  ███╔╝   ███╔╝    ║`);
    console.log(`║   ██╔══██╗██║   ██║   ██║   ██╔══╝  ██║ ███╔╝   ███╔╝     ║`);
    console.log(`║   ██████╔╝╚██████╔╝   ██║   ██║     ██║███████╗███████╗   ║`);
    console.log(`║   ╚═════╝  ╚═════╝    ╚═╝   ╚═╝     ╚═╝╚══════╝╚══════╝   ║`);
    console.log(`║                                                           ║`);
    console.log(`║   WhatsApp SaaS Platform       v${BOTFIZZ_VERSION.padEnd(18)}║`);
    console.log(`║   © 2025 Botfizz — All Rights Reserved            ║`);
    console.log(`║   https://botfizz.com                             ║`);
    console.log(`║                                                    ║`);
    console.log(`╚${line}╝${RESET}\n`);
  },
};
