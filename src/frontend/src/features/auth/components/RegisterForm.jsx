import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "../../../hooks/use-toast";
import { useAuth } from "../../../hooks/useAuth";
import { Check, X, Eye, EyeOff } from "lucide-react";

/**
 * Format registration errors into user-friendly messages
 * Maps error codes and technical messages to clear, actionable messages
 */
const formatRegistrationError = (error) => {
  // Extract error data from various response formats
  const errorData = error?.response?.data || error?.data || error;
  const code = errorData?.code;
  const message = errorData?.message || error?.message;
  const status = error?.response?.status || error?.status;

  // Map error codes to user-friendly messages
  const errorCodeMessages = {
    // Registration specific errors
    1027: "You have exceeded the registration limit. Please try again later or contact our support team for assistance.",
    1001: "This username is already taken. Please choose a different username.",
    1002: "This email address is already registered. Try logging in or use a different email.",
    1003: "Invalid email format. Please enter a valid email address.",
    1004: "Password is too weak. Please use at least 8 characters with letters and numbers.",
    1005: "Username must be between 3-50 characters and contain only letters, numbers, and underscores.",
    1006: "Full name is required. Please enter your full name.",
    1007: "Password and confirmation password do not match.",
    1008: "Registration is temporarily disabled. Please try again later.",
    1009: "Invalid registration data. Please check your information and try again.",

    // General authentication errors
    1010: "Session expired. Please refresh the page and try again.",
    1011: "Account verification required. Please check your email.",
    1012: "This account has been suspended. Please contact support.",
  };

  // Check for known error codes
  if (code && errorCodeMessages[code]) {
    return errorCodeMessages[code];
  }

  // Handle HTTP status codes
  if (status === 429 || message?.toLowerCase().includes('rate limit') || message?.toLowerCase().includes('too many')) {
    return "Too many registration attempts. Please wait a few minutes before trying again.";
  }

  if (status === 503 || status === 502) {
    return "Our service is temporarily unavailable. Please try again in a few minutes.";
  }

  if (status === 500) {
    return "Something went wrong on our end. Please try again later or contact support if the issue persists.";
  }

  if (status === 400) {
    // Try to extract meaningful message from 400 errors
    if (message && !message.includes('code') && message.length < 200) {
      return message;
    }
    return "Invalid registration information. Please check your details and try again.";
  }

  // Handle network errors
  if (error?.code === 'ERR_NETWORK' || message?.includes('Network Error')) {
    return "Unable to connect to our servers. Please check your internet connection and try again.";
  }

  // Handle timeout errors
  if (error?.code === 'ECONNABORTED' || message?.includes('timeout')) {
    return "The request timed out. Please check your connection and try again.";
  }

  // If we have a clean, user-friendly message from the server, use it
  if (message && typeof message === 'string' && message.length < 200) {
    // Filter out technical-looking messages
    const technicalPatterns = [
      /error\s*code/i,
      /exception/i,
      /stack\s*trace/i,
      /null\s*pointer/i,
      /undefined/i,
      /^\{.*\}$/,  // JSON-like strings
      /^\[.*\]$/,  // Array-like strings
    ];

    const isTechnical = technicalPatterns.some(pattern => pattern.test(message));

    if (!isTechnical) {
      return message;
    }
  }

  // Default fallback message
  return "Registration failed. Please check your information and try again. If the problem continues, contact our support team.";
};

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    password: "",
    confirmpass: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Password validation logic
  const passwordValidation = useMemo(() => {
    const password = formData.password;
    return {
      minLength: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
    };
  }, [formData.password]);

  // Check if all password requirements are met
  const isPasswordValid = useMemo(() => {
    return Object.values(passwordValidation).every(Boolean);
  }, [passwordValidation]);

  // Calculate password strength
  const passwordStrength = useMemo(() => {
    const validCount = Object.values(passwordValidation).filter(Boolean).length;
    if (validCount === 0) return { level: 0, label: "", color: "" };
    if (validCount <= 2) return { level: 1, label: "Weak", color: "bg-red-500" };
    if (validCount === 3) return { level: 2, label: "Fair", color: "bg-amber-500" };
    return { level: 3, label: "Strong", color: "bg-emerald-500" };
  }, [passwordValidation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register: registerUser } = useAuth();

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
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

    if (formData.password !== formData.confirmpass) {
      const msg = "Confirmation password does not match!";
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
      await registerUser({
        username: formData.username,
        password: formData.password,
        confirmPass: formData.confirmpass,
        email: formData.email,
        fullName: formData.fullname,
        roles: ["USER"],
      });
      toast({
        variant: "success",
        title: "Registration successful! ✨",
        description: "Please log in to continue.",
      });
      navigate("/login");
    } catch (err) {
      const msg = formatRegistrationError(err);
      setError(msg);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    // Get Google OAuth config from environment variables
    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      "424511485278-d36bocf4e3avqsadguauellt3gn4l412.apps.googleusercontent.com";

    // Redirect to backend authentication endpoint
    const redirectUri =
      import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
      "http://localhost:8000/identity/auth/authentication";

    // Build Google OAuth2 authorization URL
    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent("openid email profile")}&` +
      `access_type=offline&` +
      `prompt=consent`;

    // Redirect to Google OAuth
    window.location.href = googleAuthUrl;
  };



  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-5 overflow-auto">
      <div className="w-full max-w-md mx-auto my-5">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl px-10 py-12 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_70px_-15px_rgba(0,0,0,0.6)] border border-gray-200/50 dark:border-gray-700/50">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Create Account
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm m-0">
              Join us and start your journey
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
          <form onSubmit={handleSubmit} className="mb-6 space-y-5">{/* Username */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Choose a unique username"
                className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl text-sm transition-all duration-300 outline-none focus:border-gray-900 dark:focus:border-gray-300 focus:ring-4 focus:ring-gray-900/10 dark:focus:ring-gray-300/10 hover:border-gray-300 dark:hover:border-gray-500"
              />
            </div>

            {/* Full Name */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                Full Name
              </label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl text-sm transition-all duration-300 outline-none focus:border-gray-900 dark:focus:border-gray-300 focus:ring-4 focus:ring-gray-900/10 dark:focus:ring-gray-300/10 hover:border-gray-300 dark:hover:border-gray-500"
              />
            </div>

            {/* Email */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
                className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl text-sm transition-all duration-300 outline-none focus:border-gray-900 dark:focus:border-gray-300 focus:ring-4 focus:ring-gray-900/10 dark:focus:ring-gray-300/10 hover:border-gray-300 dark:hover:border-gray-500"
              />
            </div>

            {/* Password with Validation */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
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
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="mt-3 space-y-2 animate-[fadeIn_0.3s_ease-in-out]">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.level / 3) * 100}%` }}
                      />
                    </div>
                    {passwordStrength.label && (
                      <span className={`text-xs font-semibold ${
                        passwordStrength.level === 1 ? "text-red-600 dark:text-red-400" :
                        passwordStrength.level === 2 ? "text-amber-600 dark:text-amber-400" :
                        "text-emerald-600 dark:text-emerald-400"
                      }`}>
                        {passwordStrength.label}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Password Requirements */}
              {(passwordFocused || formData.password) && (
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
                        <div className={`shrink-0 rounded-full p-0.5 transition-all duration-300 ${
                          passwordValidation[requirement.key]
                            ? "bg-emerald-500 scale-100"
                            : "bg-gray-300 dark:bg-gray-600 scale-90"
                        }`}>
                          <Check className={`h-3 w-3 transition-all duration-300 ${
                            passwordValidation[requirement.key]
                              ? "text-white opacity-100"
                              : "text-transparent opacity-0"
                          }`} />
                        </div>
                        <span className={`text-xs transition-colors duration-300 ${
                          passwordValidation[requirement.key]
                            ? "text-emerald-700 dark:text-emerald-400 font-medium"
                            : "text-gray-500 dark:text-gray-400"
                        }`}>
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
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmpass"
                  value={formData.confirmpass}
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
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Match Indicator */}
              {formData.confirmpass && (
                <div className="mt-2 animate-[fadeIn_0.3s_ease-in-out]">
                  {formData.password === formData.confirmpass ? (
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

            {/* Register Button */}
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
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6 gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
            <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">Or continue with</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
          </div>

          {/* Social Login */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={loginWithGoogle}
              className="flex-1 p-3.5 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-sm text-gray-700 dark:text-gray-200 hover:border-gray-900 dark:hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>


          </div>

          {/* Login Link */}
          <div className="text-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
            </span>
            <Link
              to="/login"
              className="text-gray-900 dark:text-gray-100 bg-transparent border-none cursor-pointer font-semibold transition-all duration-300 hover:text-gray-600 dark:hover:text-gray-300 text-sm hover:underline underline-offset-4"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
