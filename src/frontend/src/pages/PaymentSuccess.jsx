import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle, Sparkles, Crown } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const [countdown, setCountdown] = useState(5);

  // Listen for dark mode changes
  useEffect(() => {
    const checkDarkMode = () => {
      const darkModeStorage = localStorage.getItem("darkMode") === "true";
      const bodyHasDark = document.body.classList.contains("dark");
      setIsDarkMode(darkModeStorage || bodyHasDark);
    };
    checkDarkMode();
    window.addEventListener("storage", checkDarkMode);
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => {
      window.removeEventListener("storage", checkDarkMode);
      observer.disconnect();
    };
  }, []);

  // Auto redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Force reload to update premium status
          window.location.href = "/home";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleGoHome = () => {
    // Force reload to update premium status
    window.location.href = "/home";
  };

  const handleStartCreating = () => {
    window.location.href = "/create";
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-slate-900" : "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"
      } flex items-center justify-center p-4 font-sans relative overflow-hidden`}
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute -left-20 top-10 h-64 w-64 rounded-full ${
            isDarkMode ? "bg-green-500/10" : "bg-green-300/30"
          } blur-3xl`}
        />
        <div
          className={`absolute right-0 top-20 h-72 w-72 rounded-full ${
            isDarkMode ? "bg-emerald-500/10" : "bg-emerald-200/40"
          } blur-3xl`}
        />
        <div
          className={`absolute bottom-10 left-1/3 h-56 w-56 rounded-full ${
            isDarkMode ? "bg-teal-500/10" : "bg-teal-200/30"
          } blur-3xl`}
        />
      </div>

      <div
        className={`max-w-md w-full ${
          isDarkMode
            ? "bg-slate-800/80 border-slate-700"
            : "bg-white/80 border-green-100"
        } backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center border relative z-10`}
      >
        {/* Success icon with animation */}
        <div className="relative mx-auto h-28 w-28 mb-6">
          <div
            className={`absolute inset-0 ${
              isDarkMode ? "bg-green-500/20" : "bg-green-100"
            } rounded-full animate-ping opacity-30`}
          />
          <div
            className={`relative h-full w-full ${
              isDarkMode ? "bg-green-500/30" : "bg-green-100"
            } rounded-full flex items-center justify-center ring-8 ${
              isDarkMode ? "ring-green-500/10" : "ring-green-50"
            }`}
          >
            <CheckCircle
              className={`h-14 w-14 ${
                isDarkMode ? "text-green-400" : "text-green-600"
              }`}
            />
          </div>
        </div>

        {/* Crown badge */}
        <div className="flex justify-center mb-4">
          <span
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${
              isDarkMode
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200"
            }`}
          >
            <Crown className="h-4 w-4" />
            Premium Activated
            <Sparkles className="h-4 w-4" />
          </span>
        </div>

        <h1
          className={`text-3xl font-bold mb-3 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Payment Successful! 🎉
        </h1>

        <p
          className={`mb-8 leading-relaxed ${
            isDarkMode ? "text-slate-300" : "text-gray-600"
          }`}
        >
          Thank you for upgrading! Your account is now{" "}
          <span
            className={`font-bold ${
              isDarkMode ? "text-amber-400" : "text-amber-600"
            }`}
          >
            Premium
          </span>
          . Enjoy unlimited access to all features!
        </p>

        <button
          type="button"
          onClick={handleStartCreating}
          className={`w-full font-semibold py-3.5 px-6 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 hover:shadow-xl flex items-center justify-center gap-2 mb-3 ${
            isDarkMode
              ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-green-500/25"
              : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-green-200"
          }`}
        >
          <Sparkles className="h-5 w-5" />
          Start Creating
          <ArrowRight className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={handleGoHome}
          className={`w-full font-medium py-3 px-6 rounded-xl border transition-all flex items-center justify-center gap-2 ${
            isDarkMode
              ? "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          Go to Home
        </button>

        <p
          className={`mt-6 text-sm ${
            isDarkMode ? "text-slate-500" : "text-gray-400"
          }`}
        >
          Auto redirect in{" "}
          <span
            className={`font-bold ${
              isDarkMode ? "text-green-400" : "text-green-600"
            }`}
          >
            {countdown}s
          </span>
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
