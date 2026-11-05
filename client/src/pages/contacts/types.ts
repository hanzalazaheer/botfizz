/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import { type Contact, type InsertContact } from "@shared/schema";

export interface ContactsResponse {
  data: Contact[];
  pagination: {
    page: number;
    limit: number;
    count: number;
    total: number;
    totalPages: number;
  };
}

export interface TemplateVariable {
  type?: "fullName" | "phone" | "custom";
  value?: string;
}

export type TemplateVariables = {
  [key: string]: TemplateVariable;
};

export type { Contact, InsertContact };
