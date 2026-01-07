import React, { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "../../../hooks/use-toast";
import { 
  Lock, 
  ArrowLeft, 
  CheckCircle, 
  X, 
  Eye, 
  EyeOff, 
  Check, 
  Loader2,
  AlertTriangle,
  ShieldCheck
} from "lucide-react";
import { authApi } from "../../../api/authApi";


const formatResetPasswordError = (error) => {
  const errorData = error?.response?.data || error?.data || error;
  const code = errorData?.code;
  const message = errorData?.message || error?.message;
  const status = error?.response?.status || error?.status;

  const errorCodeMessages = {
    1031: "This password reset link has expired. Please request a new one.",
    1032: "Invalid password reset link. Please request a new one.",
    1017: "Passwords do not match.",
    1012: "Password must be between 4 and 30 characters.",
    1011: "Password is required.",
    1001: "User not found.",
  };

  if (code && errorCodeMessages[code]) {
    return errorCodeMessages[code];
  }

  if (status === 400 && message) {
    return message;
  }

  if (error?.code === "ERR_NETWORK" || message?.includes("Network Error")) {
    return "Unable to connect to our servers. Please check your internet connection.";
  }

  if (message && typeof message === "string" && message.length < 200) {
    return message;
  }

  return "Failed to reset password. Please try again.";
};

const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenEmail, setTokenEmail] = useState("");
  const [success, setSuccess] = useState(false);

  // Password validation logic (same as RegisterForm)
  const passwordValidation = useMemo(() => {
    const password = formData.newPassword;
    return {
      minLength: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
    };
  }, [formData.newPassword]);

  // Check if all password requirements are met
  const isPasswordValid = useMemo(() => {
    return Object.values(passwordValidation).every(Boolean);
  }, [passwordValidation]);

  // Calculate password strength
  const passwordStrength = useMemo(() => {
    const validCount = Object.values(passwordValidation).filter(Boolean).length;
    if (validCount === 0) return { level: 0, label: "", color: "" };
    if (validCount <= 2)
      return { level: 1, label: "Weak", color: "bg-red-500" };
    if (validCount === 3)
      return { level: 2, label: "Fair", color: "bg-amber-500" };
    return { level: 3, label: "Strong", color: "bg-emerald-500" };
  }, [passwordValidation]);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setError("No reset token provided. Please request a new password reset link.");
        setValidating(false);
        return;
      }

      try {
        const response = await authApi.validateResetToken(token);
        const result = response?.data?.result;

        if (result?.valid) {
          setTokenValid(true);
          setTokenEmail(result.email || "");
        } else {
          setTokenValid(false);
          setError(result?.message || "Invalid or expired reset link.");
        }
      } catch (err) {
        setTokenValid(false);
        setError(formatResetPasswordError(err));
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate password requirements
    if (!isPasswordValid) {
      const msg = "Password must meet all requirements";
      setError(msg);
      toast({
        variant: "destructive",
        title: "Invalid password",
        description: msg,
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      const msg = "Passwords do not match!";
      setError(msg);
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: msg,
      });
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, formData.newPassword, formData.confirmPassword);
      setSuccess(true);
      toast({
        variant: "success",
        title: "Password Reset Successful! 🎉",
        description: "You can now login with your new password.",
      });
    } catch (err) {
      const msg = formatResetPasswordError(err);
      setError(msg);
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state while validating token
  if (validating) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-5">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl px-10 py-12 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_70px_-15px_rgba(0,0,0,0.6)] border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-center">
              <Loader2 className="w-12 h-12 mx-auto text-gray-600 dark:text-gray-300 animate-spin mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Validating Reset Link
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Please wait while we verify your reset link...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-5">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl px-10 py-12 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_70px_-15px_rgba(0,0,0,0.6)] border border-gray-200/50 dark:border-gray-700/50">
            {/* Error Icon */}
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Link Invalid or Expired
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                {error || "This password reset link is no longer valid."}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Link
                to="/forgot-password"
                className="block w-full py-3.5 text-center bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-100 dark:to-gray-200 text-white dark:text-gray-900 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Request New Reset Link
              </Link>
              
              <Link
                to="/login"
                className="block w-full py-3.5 text-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-base font-semibold transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-5">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl px-10 py-12 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_70px_-15px_rgba(0,0,0,0.6)] border border-gray-200/50 dark:border-gray-700/50">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-full flex items-center justify-center mb-6 animate-[fadeIn_0.5s_ease-in-out]">
                <ShieldCheck className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Password Reset Complete!
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
            </div>

            {/* Login Button */}
            <Link
              to="/login"
              className="block w-full py-3.5 text-center bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-100 dark:to-gray-200 text-white dark:text-gray-900 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-5 overflow-auto">
      <div className="w-full max-w-md mx-auto my-5">
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
              <Lock className="w-8 h-8 text-gray-600 dark:text-gray-300" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Create New Password
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {tokenEmail && (
                <>
                  Enter a new password for <br />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{tokenEmail}</span>
                </>
              )}
              {!tokenEmail && "Enter your new password below."}
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
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  onFocus={() => setPasswordFocused(true)}
                  required
                  placeholder="Create a strong password"
                  className="w-full px-4 py-3.5 pr-12 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl text-sm transition-all duration-300 outline-none focus:border-gray-900 dark:focus:border-gray-300 focus:ring-4 focus:ring-gray-900/10 dark:focus:ring-gray-300/10 hover:border-gray-300 dark:hover:border-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password Strength Meter */}
              {formData.newPassword && (
                <div className="mt-3 space-y-2 animate-[fadeIn_0.3s_ease-in-out]">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${passwordStrength.color}`}
                        style={{
                          width: `${(passwordStrength.level / 3) * 100}%`,
                        }}
                      />
                    </div>
                    {passwordStrength.label && (
                      <span
                        className={`text-xs font-semibold ${
                          passwordStrength.level === 1
                            ? "text-red-600 dark:text-red-400"
                            : passwordStrength.level === 2
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Password Requirements */}
              {(passwordFocused || formData.newPassword) && (
                <div className="mt-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 animate-[fadeIn_0.3s_ease-in-out]">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Password must contain:
                  </p>
                  <div className="space-y-2">
                    {[
                      { key: "minLength", label: "At least 8 characters" },
                      { key: "hasLowercase", label: "One lowercase letter (a-z)" },
                      { key: "hasUppercase", label: "One uppercase letter (A-Z)" },
                      { key: "hasNumber", label: "One number (0-9)" },
                    ].map((requirement) => (
                      <div key={requirement.key} className="flex items-center gap-2">
                        <div
                          className={`shrink-0 rounded-full p-0.5 transition-all duration-300 ${
                            passwordValidation[requirement.key]
                              ? "bg-emerald-500 scale-100"
                              : "bg-gray-300 dark:bg-gray-600 scale-90"
                          }`}
                        >
                          <Check
                            className={`h-3 w-3 transition-all duration-300 ${
                              passwordValidation[requirement.key]
                                ? "text-white opacity-100"
                                : "text-transparent opacity-0"
                            }`}
                          />
                        </div>
                        <span
                          className={`text-xs transition-colors duration-300 ${
                            passwordValidation[requirement.key]
                              ? "text-emerald-700 dark:text-emerald-400 font-medium"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {requirement.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-3.5 pr-12 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl text-sm transition-all duration-300 outline-none focus:border-gray-900 dark:focus:border-gray-300 focus:ring-4 focus:ring-gray-900/10 dark:focus:ring-gray-300/10 hover:border-gray-300 dark:hover:border-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-2 animate-[fadeIn_0.3s_ease-in-out]">
                  {formData.newPassword === formData.confirmPassword ? (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <Check className="h-4 w-4" />
                      <span className="text-xs font-medium">Passwords match</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <X className="h-4 w-4" />
                      <span className="text-xs font-medium">Passwords don't match</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isPasswordValid}
              className={`w-full py-3.5 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-100 dark:to-gray-200 text-white dark:text-gray-900 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                loading || !isPasswordValid
                  ? "opacity-50 cursor-not-allowed hover:scale-100"
                  : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Resetting Password...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
