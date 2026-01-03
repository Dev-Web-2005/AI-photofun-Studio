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
      passwordsMatch: newPassword === confirmNewPassword && confirmNewPassword !== "",
    };
  }, [passwordForm.newPassword, passwordForm.confirmNewPassword]);

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
        setPasswordForm({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
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
    setPasswordForm({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeChangePasswordModal}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                  <Lock className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Change Password
                  </h2>
                  <p className="text-xs text-gray-500">
                    Update your account security
                  </p>
                </div>
              </div>
              <button
                onClick={closeChangePasswordModal}
                className="p-2 rounded-full hover:bg-white/80 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Success Message */}
              {passwordSuccess && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <p className="text-sm font-medium text-emerald-700">
                    Password changed successfully!
                  </p>
                </div>
              )}

              {/* Error Message */}
              {passwordError && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm font-medium text-red-700">
                    {passwordError}
                  </p>
                </div>
              )}

              {/* Current Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.old ? "text" : "password"}
                    value={passwordForm.oldPassword}
                    onChange={(e) =>
                      handlePasswordChange("oldPassword", e.target.value)
                    }
                    placeholder="Enter your current password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, old: !prev.old }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
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
                <label className="block text-sm font-semibold text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      handlePasswordChange("newPassword", e.target.value)
                    }
                    placeholder="Enter your new password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Password Requirements */}
                {passwordForm.newPassword && (
                  <div className="mt-3 p-3 rounded-lg bg-gray-50 space-y-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Password Requirements
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div
                        className={`flex items-center gap-1.5 ${
                          passwordValidation.minLength
                            ? "text-emerald-600"
                            : "text-gray-400"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>At least 8 characters</span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 ${
                          passwordValidation.hasUppercase
                            ? "text-emerald-600"
                            : "text-gray-400"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>One uppercase letter</span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 ${
                          passwordValidation.hasLowercase
                            ? "text-emerald-600"
                            : "text-gray-400"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>One lowercase letter</span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 ${
                          passwordValidation.hasNumber
                            ? "text-emerald-600"
                            : "text-gray-400"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>One number</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmNewPassword}
                    onChange={(e) =>
                      handlePasswordChange("confirmNewPassword", e.target.value)
                    }
                    placeholder="Confirm your new password"
                    className={`w-full px-4 py-3 pr-12 rounded-xl border outline-none transition-all ${
                      passwordForm.confirmNewPassword
                        ? passwordValidation.passwordsMatch
                          ? "border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                          : "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {passwordForm.confirmNewPassword &&
                  !passwordValidation.passwordsMatch && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Passwords do not match
                    </p>
                  )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={closeChangePasswordModal}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={!isPasswordValid || passwordLoading}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center gap-2 ${
                  isPasswordValid && !passwordLoading
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Change Password
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
