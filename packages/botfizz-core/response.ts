/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import type { Response } from "express";
import { HTTP_STATUS } from "./constants";

export interface BotfizzApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export class BotfizzResponse {
  static success<T>(res: Response, data?: T, message?: string, statusCode = HTTP_STATUS.OK): Response {
    const body: BotfizzApiResponse<T> = {
      success: true,
      ...(message && { message }),
      ...(data !== undefined && { data }),
    };
    return res.status(statusCode).json(body);
  }

  static created<T>(res: Response, data?: T, message = "Resource created successfully"): Response {
    return BotfizzResponse.success(res, data, message, HTTP_STATUS.CREATED);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    message?: string
  ): Response {
    const totalPages = Math.ceil(total / limit);
    const body: BotfizzApiResponse<T[]> = {
      success: true,
      ...(message && { message }),
      data,
      meta: { page, limit, total, totalPages },
    };
    return res.status(HTTP_STATUS.OK).json(body);
  }

  static error(
    res: Response,
    message = "An error occurred",
    statusCode = HTTP_STATUS.INTERNAL_ERROR,
    errors?: Record<string, string[]>
  ): Response {
    const body: BotfizzApiResponse = {
      success: false,
      message,
      ...(errors && { errors }),
    };
    return res.status(statusCode).json(body);
  }

  static noContent(res: Response): Response {
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }
}
