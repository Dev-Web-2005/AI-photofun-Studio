import React, { useEffect, useMemo, useState } from "react";
import {
  Coins,
  KeyRound,
  Link2,
  Lock,
  ShieldCheck,
  Sparkles,
  Trash2,
  Crown,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { userApi } from "../api/userApi";

const Settings = () => {
  const { user } = useAuth();

  // Change Password Modal State
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Password validation
  const passwordValidation = useMemo(() => {
    const { newPassword, confirmNewPassword } = passwordForm;
    return {
      minLength: newPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(newPassword),
      hasLowercase: /[a-z]/.test(newPassword),
      hasNumber: /\d/.test(newPassword),
      passwordsMatch:
        newPassword === confirmNewPassword && confirmNewPassword !== "",
    };
  }, [passwordForm.newPassword, passwordForm.confirmNewPassword]);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const { newPassword } = passwordForm;
    if (!newPassword) return { level: 0, label: "", color: "" };

    const validCount = [
      passwordValidation.minLength,
      passwordValidation.hasUppercase,
      passwordValidation.hasLowercase,
      passwordValidation.hasNumber,
    ].filter(Boolean).length;

    if (validCount === 0) return { level: 0, label: "", color: "" };
    if (validCount <= 2)
      return { level: 1, label: "Weak", color: "bg-red-500 dark:bg-red-400" };
    if (validCount === 3)
      return {
        level: 2,
        label: "Fair",
        color: "bg-amber-500 dark:bg-amber-400",
      };
    return {
      level: 3,
      label: "Strong",
      color: "bg-emerald-500 dark:bg-emerald-400",
    };
  }, [passwordForm.newPassword, passwordValidation]);

  const isPasswordValid = useMemo(() => {
    return (
      passwordValidation.minLength &&
      passwordValidation.hasUppercase &&
      passwordValidation.hasLowercase &&
      passwordValidation.hasNumber &&
      passwordValidation.passwordsMatch &&
      passwordForm.oldPassword.length > 0
    );
  }, [passwordValidation, passwordForm.oldPassword]);

  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordError("");
    setPasswordSuccess(false);
  };

  const handleChangePassword = async () => {
    if (!isPasswordValid) return;

    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess(false);

    try {
      const response = await userApi.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmNewPassword,
      });

      if (response.data?.result) {
        setPasswordSuccess(true);
        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
        setTimeout(() => {
          setIsChangePasswordOpen(false);
          setPasswordSuccess(false);
        }, 2000);
      } else {
        setPasswordError(response.data?.message || "Failed to change password");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to change password. Please try again.";
      setPasswordError(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  const closeChangePasswordModal = () => {
    setIsChangePasswordOpen(false);
    setPasswordForm({
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setPasswordError("");
    setPasswordSuccess(false);
    setShowPasswords({ old: false, new: false, confirm: false });
  };

  // Xác định trạng thái premium và loại gói
  const isPremiumOneMonth = Boolean(user?.premiumOneMonth);
  const isPremiumSixMonths = Boolean(user?.premiumSixMonths);
  const isPremium =
    isPremiumOneMonth ||
    isPremiumSixMonths ||
    Boolean(user?.isPremium || user?.premium);

  // Determine current plan name
  const currentPlanName = useMemo(() => {
    if (isPremiumSixMonths) return "Premium 6 Months";
    if (isPremiumOneMonth) return "Premium 1 Month";
    if (isPremium) return "Premium";
    return "Free";
  }, [isPremiumOneMonth, isPremiumSixMonths, isPremium]);

  const tokenBalance = user?.tokens ?? 0;
  const dailyLimit = isPremium ? 500 : 200; // Premium có giới hạn cao hơn
  const tokenUsagePercent = dailyLimit
    ? Math.min(tokenBalance / dailyLimit, 1) * 100
    : 0;

  const accountActions = [
    {
      id: "change-password",
      title: "Change Password",
      description: "Update your password to protect your account.",
      actionLabel: "Update",
      icon: Lock,
    },
    {
      id: "set-email-password",
      title: "Set Email Password",
      description:
        "Create a password when you previously only logged in with Google or social accounts.",
      actionLabel: "Set Up",
      icon: KeyRound,
    },
  ];

  // Trạng thái liên kết Google (dựa vào xác minh email)
  const [googleLinked, setGoogleLinked] = useState(false);

  useEffect(() => {
    const checkGoogleLinkStatus = async () => {
      try {
        const response = await userApi.checkVerifyStatus();
        const isVerified = response.data?.result ?? false;
        setGoogleLinked(isVerified);
      } catch (error) {
        console.error("Failed to check Google link status:", error);
        setGoogleLinked(false);
      }
    };
    checkGoogleLinkStatus();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="space-y-1">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Settings
        </p>
        <h1 className="text-3xl font-bold">Settings Center</h1>
        <p className="text-sm text-gray-500">
          Manage your account information, security, and service plans.
        </p>
      </header>

      <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold">Account</h2>
          <p className="text-sm text-gray-500">
            Security settings and controls for your profile.
          </p>
        </div>

        <div className="space-y-4">
          {accountActions.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-gray-100 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="p-2 rounded-full bg-gray-50 text-gray-700">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (item.id === "change-password") {
                      setIsChangePasswordOpen(true);
                    } else {
                      alert("This feature is not yet supported");
                    }
                  }}
                  className="self-start md:self-auto px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  {item.actionLabel}
                </button>
              </div>
            );
          })}

          <div className="border border-gray-100 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-full bg-indigo-50 text-indigo-600">
                <Link2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Social Account Status
                </h3>
                <p className="text-sm text-gray-500">
                  Sync platforms you've connected for faster login.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                  googleLinked
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-gray-50 text-gray-600"
                }`}
              >
                Google — {googleLinked ? "Linked" : "Not linked"}
              </span>
            </div>
          </div>

          <div className="border border-red-200 rounded-xl p-4 bg-red-50">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-full bg-white text-red-500">
                <Trash2 className="w-5 h-5" />
              </span>
              <div className="flex-1">
                <h3 className="font-semibold text-red-700">Delete Account</h3>
                <p className="text-sm text-red-600">
                  This action will delete all your data. This cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert("This feature is not yet supported")}
                className="px-4 py-2 rounded-lg border border-red-200 text-sm font-semibold text-red-600 hover:bg-white cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {isPremium && (
        <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Premium Plan
            </h2>
            <p className="text-sm text-gray-500">
              Your current Premium plan information.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="border border-yellow-200 rounded-xl p-5 space-y-4 bg-gradient-to-br from-yellow-50 to-orange-50">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  <Crown className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-sm text-gray-500">Current Plan</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      {currentPlanName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                      {isPremiumSixMonths
                        ? "6 MONTHS"
                        : isPremiumOneMonth
                        ? "1 MONTH"
                        : "PRO"}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {isPremiumSixMonths
                  ? "You are using the 6-month Premium plan with all premium features."
                  : isPremiumOneMonth
                  ? "You are using the 1-month Premium plan with all premium features."
                  : "You have unlocked all premium tools."}
              </p>
            </div>

            <div className="border border-gray-100 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-full bg-emerald-50 text-emerald-600">
                  <Coins className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-sm text-gray-500">Monthly Token Balance</p>
                  <h3 className="text-3xl font-bold">
                    {tokenBalance}
                    <span className="text-base font-normal text-gray-500 ml-2">
                      tokens
                    </span>
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <ShieldCheck className="w-4 h-4" />
                Tokens will be refreshed on the first day of next month.
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-in-out]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
            onClick={closeChangePasswordModal}
          />

          {/* Modal */}
          <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_70px_-15px_rgba(0,0,0,0.4)] dark:shadow-[0_20px_70px_-15px_rgba(0,0,0,0.8)] border border-gray-200/50 dark:border-gray-700/50 w-full max-w-md overflow-hidden animate-[fadeIn_0.3s_ease-in-out]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gray-900 dark:bg-gray-100 rounded-xl opacity-20 blur-lg" />
                  <span className="relative p-2.5 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 shadow-lg">
                    <Lock className="w-5 h-5" />
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Change Password
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Update your account security
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeChangePasswordModal}
                className="p-2 rounded-xl hover:bg-white/80 dark:hover:bg-gray-600/80 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all hover:scale-110 active:scale-95"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Success Message */}
              {passwordSuccess && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800 animate-[fadeIn_0.3s_ease-in-out]">
                  <div className="shrink-0 mt-0.5">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500 rounded-full opacity-20 animate-ping" />
                      <div className="relative bg-emerald-100 dark:bg-emerald-900/50 rounded-full p-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 leading-relaxed">
                      Password changed successfully!
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                      Your account is now more secure.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {passwordError && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 animate-[fadeIn_0.3s_ease-in-out]">
                  <div className="shrink-0 mt-0.5">
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500 rounded-full opacity-20 animate-ping" />
                      <div className="relative bg-red-100 dark:bg-red-900/50 rounded-full p-1">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-200 leading-relaxed">
                      {passwordError}
                    </p>
                  </div>
                </div>
              )}

              {/* Current Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <div className="relative group">
                  <input
                    type={showPasswords.old ? "text" : "password"}
                    value={passwordForm.oldPassword}
                    onChange={(e) =>
                      handlePasswordChange("oldPassword", e.target.value)
                    }
                    placeholder="Enter your current password"
                    className="w-full px-4 py-3.5 pr-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-gray-900 dark:focus:border-gray-300 focus:ring-4 focus:ring-gray-900/10 dark:focus:ring-gray-300/10 outline-none transition-all hover:border-gray-300 dark:hover:border-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, old: !prev.old }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                    aria-label={
                      showPasswords.old ? "Hide password" : "Show password"
                    }
                  >
                    {showPasswords.old ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <div className="relative group">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      handlePasswordChange("newPassword", e.target.value)
                    }
                    placeholder="Enter your new password"
                    className="w-full px-4 py-3.5 pr-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-gray-900 dark:focus:border-gray-300 focus:ring-4 focus:ring-gray-900/10 dark:focus:ring-gray-300/10 outline-none transition-all hover:border-gray-300 dark:hover:border-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                    aria-label={
                      showPasswords.new ? "Hide password" : "Show password"
                    }
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {passwordForm.newPassword && (
                  <div className="mt-3 space-y-2 animate-[fadeIn_0.3s_ease-in-out]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${passwordStrength.color}`}
                          style={{
                            width: `${(passwordStrength.level / 3) * 100}%`,
                          }}
                        />
                      </div>
                      {passwordStrength.label && (
                        <span
                          className={`text-xs font-semibold min-w-[60px] text-right ${
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
                {passwordForm.newPassword && (
                  <div className="mt-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 space-y-3 animate-[fadeIn_0.3s_ease-in-out]">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Password must contain:
                    </p>
                    <div className="space-y-2">
                      {[
                        { key: "minLength", label: "At least 8 characters" },
                        {
                          key: "hasLowercase",
                          label: "One lowercase letter (a-z)",
                        },
                        {
                          key: "hasUppercase",
                          label: "One uppercase letter (A-Z)",
                        },
                        { key: "hasNumber", label: "One number (0-9)" },
                      ].map((requirement) => (
                        <div
                          key={requirement.key}
                          className="flex items-center gap-2"
                        >
                          <div
                            className={`shrink-0 rounded-full p-0.5 transition-all duration-300 ${
                              passwordValidation[requirement.key]
                                ? "bg-emerald-500 scale-100"
                                : "bg-gray-300 dark:bg-gray-600 scale-90"
                            }`}
                          >
                            <CheckCircle2
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

              {/* Confirm New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <div className="relative group">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmNewPassword}
                    onChange={(e) =>
                      handlePasswordChange("confirmNewPassword", e.target.value)
                    }
                    placeholder="Re-enter your new password"
                    className={`w-full px-4 py-3.5 pr-12 rounded-xl border-2 outline-none transition-all ${
                      passwordForm.confirmNewPassword
                        ? passwordValidation.passwordsMatch
                          ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10 text-gray-900 dark:text-gray-100 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20"
                          : "border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10 text-gray-900 dark:text-gray-100 focus:border-red-500 dark:focus:border-red-400 focus:ring-4 focus:ring-red-500/20 dark:focus:ring-red-400/20"
                        : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-gray-900 dark:focus:border-gray-300 focus:ring-4 focus:ring-gray-900/10 dark:focus:ring-gray-300/10 hover:border-gray-300 dark:hover:border-gray-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                    aria-label={
                      showPasswords.confirm ? "Hide password" : "Show password"
                    }
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {passwordForm.confirmNewPassword && (
                  <div className="animate-[fadeIn_0.3s_ease-in-out]">
                    {passwordValidation.passwordsMatch ? (
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs font-medium">
                          Passwords match
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">
                          Passwords don't match
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800">
              <button
                type="button"
                onClick={closeChangePasswordModal}
                className="px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={!isPasswordValid || passwordLoading}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  isPasswordValid && !passwordLoading
                    ? "bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                }`}
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Change Password</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
