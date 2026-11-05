/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

const RESEND_COOLDOWN = 60;

const VerifyEmail = () => {
  const [, setLocation] = useLocation();

  const searchParams = new URLSearchParams(window.location.search);
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }
    const digit = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (index < 5) focusInput(index + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < 5) {
      focusInput(index + 1);
    }
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = Array(6).fill("");
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const nextEmpty = Math.min(pasted.length, 5);
    focusInput(nextEmpty);
  }, []);

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await apiRequest("POST", "/api/users/verifyEmail", { email, otpCode });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Invalid code. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess("Email verified! Redirecting to dashboard...");

      // Seed auth cache with the returned user so dashboard loads immediately
      if (data.user) {
        queryClient.setQueryData(["/api/auth/me"], data.user);
      }

      setTimeout(() => setLocation("/dashboard"), 1000);
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resendLoading) return;
    setResendLoading(true);
    setError("");

    try {
      const res = await apiRequest("POST", "/api/users/resend-otp", { email });
      const data = await res.json();

      if (data.success) {
        setOtp(Array(6).fill(""));
        focusInput(0);
        setCountdown(RESEND_COOLDOWN);
        setCanResend(false);
        setSuccess("A new verification code has been sent to your email.");
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(data.message || "Failed to resend code.");
      }
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="https://botfizz.com/uploads/bf831bc9-dc48-4c4f-99b7-90a63badda73/1777789285991-botfizz.com.png"
            alt="Botfizz"
            className="h-12 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>

        <h2 className="text-2xl font-bold text-center mb-2">Verify Your Email</h2>
        <p className="text-gray-500 text-sm text-center mb-1">
          A 6-digit verification code was sent to:
        </p>
        <p className="text-center font-semibold text-gray-800 mb-6">{email}</p>

        {/* OTP inputs */}
        <div className="flex justify-between gap-2 mb-6" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              id={`otp-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              className="w-12 h-12 border-2 rounded-lg text-center text-xl font-bold focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
            />
          ))}
        </div>

        {error && <p className="text-red-600 text-sm mb-3 text-center">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-3 text-center">{success}</p>}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        {/* Resend section */}
        <div className="mt-6 text-center border-t pt-5">
          <p className="text-gray-500 text-sm mb-3">
            Didn't receive the code? Check your spam folder or request a new one.
          </p>
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-green-600 hover:text-green-700 font-medium text-sm underline disabled:opacity-50"
            >
              {resendLoading ? "Sending..." : "Resend verification code"}
            </button>
          ) : (
            <p className="text-gray-400 text-sm">
              Resend available in{" "}
              <span className="font-semibold text-gray-600">{countdown}s</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
