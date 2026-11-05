/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

export function formatDateTime(dateString:string, options = {}) {
    if (!dateString) return '';
  
    const date = new Date(dateString);
  
    // Default formatting options
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // change to true if you prefer AM/PM
    };
  
    return date.toLocaleString('en-US', { ...defaultOptions, ...options });
  }
  