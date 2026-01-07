import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "../../../hooks/use-toast";
import { Mail, ArrowLeft, CheckCircle, X, Loader2 } from "lucide-react";
import { authApi } from "../../../api/authApi";

/**
 * Format forgot password errors into user-friendly messages
 */
const formatForgotPasswordError = (error) => {
  const errorData = error?.response?.data || error?.data || error;
  const code = errorData?.code;
  const message = errorData?.message || error?.message;
  const status = error?.response?.status || error?.status;

  const errorCodeMessages = {
    1029: "No account found with this email address. Please check your email and try again.",
    1030: "This email address has not been verified. Please verify your email first.",
    1033: "Failed to send password reset email. Please try again later.",
    1014: "Email address is required.",
  };

  if (code && errorCodeMessages[code]) {
    return errorCodeMessages[code];
  }

  if (status === 429) {
    return "Too many requests. Please wait a few minutes before trying again.";
  }

  if (status === 503 || status === 502) {
    return "Our service is temporarily unavailable. Please try again in a few minutes.";
  }

  if (status === 500) {
    return "Something went wrong on our end. Please try again later.";
  }

  if (error?.code === "ERR_NETWORK" || message?.includes("Network Error")) {
    return "Unable to connect to our servers. Please check your internet connection.";
  }

  if (message && typeof message === "string" && message.length < 200) {
    return message;
  }

  return "Failed to process your request. Please try again.";
};

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      // First check if email exists and is verified
      const checkResponse = await authApi.checkEmail(email);
      const checkResult = checkResponse?.data?.result;

      if (!checkResult?.exists) {
        setError("No account found with this email address.");
        setLoading(false);
        return;
      }

      if (!checkResult?.verified) {
        setError("This email address has not been verified. Please verify your email first.");
        setLoading(false);
        return;
      }

      // Send password reset email
      await authApi.forgotPassword(email);
      setSuccess(true);
      toast({
        variant: "success",
        title: "Email Sent! ✉️",
        description: "Check your inbox for password reset instructions.",
      });
    } catch (err) {
      const msg = formatForgotPasswordError(err);
      setError(msg);
      toast({
        variant: "destructive",
        title: "Request failed",
        description: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-5">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl px-10 py-12 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_70px_-15px_rgba(0,0,0,0.6)] border border-gray-200/50 dark:border-gray-700/50">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-full flex items-center justify-center mb-6 animate-[fadeIn_0.5s_ease-in-out]">
                <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Check Your Email
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                We've sent password reset instructions to:
              </p>
              <p className="text-gray-900 dark:text-gray-100 font-semibold mt-2">
                {email}
              </p>
            </div>

            {/* Info Box */}
            <div className="mb-8 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                <strong>Note:</strong> The link will expire in 5 minutes. If you don't see the email, check your spam folder.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                }}
                className="w-full py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-base font-semibold transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Try a different email
              </button>
              
              <Link
                to="/login"
                className="block w-full py-3.5 text-center bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-100 dark:to-gray-200 text-white dark:text-gray-900 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-5">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl px-10 py-12 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_70px_-15px_rgba(0,0,0,0.6)] border border-gray-200/50 dark:border-gray-700/50">
          {/* Back Link */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mb-5">
              <Mail className="w-8 h-8 text-gray-600 dark:text-gray-300" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 animate-[fadeIn_0.3s_ease-in-out]">
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500 rounded-full opacity-20 animate-ping" />
                    <div className="relative bg-red-100 dark:bg-red-900/50 rounded-full p-1">
                      <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 dark:text-red-200 leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mb-6">
            {/* Email Input */}
            <div className="group mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your registered email"
                  className="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl text-sm transition-all duration-300 outline-none focus:border-gray-900 dark:focus:border-gray-300 focus:ring-4 focus:ring-gray-900/10 dark:focus:ring-gray-300/10 hover:border-gray-300 dark:hover:border-gray-500"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-100 dark:to-gray-200 text-white dark:text-gray-900 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                loading ? "opacity-50 cursor-not-allowed hover:scale-100" : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Remember your password?{" "}
            </span>
            <Link
              to="/login"
              className="text-gray-900 dark:text-gray-100 font-semibold text-sm hover:underline underline-offset-4 transition-all duration-300"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
