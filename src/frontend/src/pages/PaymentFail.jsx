import React, { useState, useEffect } from "react";
import { ArrowLeft, RotateCcw, XCircle, AlertTriangle } from "lucide-react";

const PaymentFail = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const [countdown, setCountdown] = useState(10);

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
          window.location.href = "/home";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleGoHome = () => {
    window.location.href = "/home";
  };

  const handleTryAgain = () => {
    window.location.href = "/pricing";
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-slate-900" : "bg-gradient-to-br from-red-50 via-rose-50 to-orange-50"
      } flex items-center justify-center p-4 font-sans relative overflow-hidden`}
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute -left-20 top-10 h-64 w-64 rounded-full ${
            isDarkMode ? "bg-red-500/10" : "bg-red-200/30"
          } blur-3xl`}
        />
        <div
          className={`absolute right-0 top-20 h-72 w-72 rounded-full ${
            isDarkMode ? "bg-orange-500/10" : "bg-orange-200/30"
          } blur-3xl`}
        />
        <div
          className={`absolute bottom-10 left-1/3 h-56 w-56 rounded-full ${
            isDarkMode ? "bg-rose-500/10" : "bg-rose-200/30"
          } blur-3xl`}
        />
      </div>

      <div
        className={`max-w-md w-full ${
          isDarkMode
            ? "bg-slate-800/80 border-slate-700"
            : "bg-white/80 border-red-100"
        } backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center border relative z-10`}
      >
        {/* Error icon */}
        <div className="relative mx-auto h-28 w-28 mb-6">
          <div
            className={`absolute inset-0 ${
              isDarkMode ? "bg-red-500/20" : "bg-red-100"
            } rounded-full animate-pulse opacity-50`}
          />
          <div
            className={`relative h-full w-full ${
              isDarkMode ? "bg-red-500/30" : "bg-red-100"
            } rounded-full flex items-center justify-center ring-8 ${
              isDarkMode ? "ring-red-500/10" : "ring-red-50"
            }`}
          >
            <XCircle
              className={`h-14 w-14 ${
                isDarkMode ? "text-red-400" : "text-red-500"
              }`}
            />
          </div>
        </div>

        {/* Warning badge */}
        <div className="flex justify-center mb-4">
          <span
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${
              isDarkMode
                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            Payment Cancelled
          </span>
        </div>

        <h1
          className={`text-2xl font-bold mb-3 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Payment Failed
        </h1>

        <p
          className={`mb-8 leading-relaxed ${
            isDarkMode ? "text-slate-300" : "text-gray-600"
          }`}
        >
          The transaction was cancelled or an error occurred during processing.
          <span
            className={`block mt-2 font-medium ${
              isDarkMode ? "text-slate-400" : "text-gray-500"
            }`}
          >
            Your account has not been charged.
          </span>
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleTryAgain}
            className={`w-full font-semibold py-3.5 px-6 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 hover:shadow-xl flex items-center justify-center gap-2 ${
              isDarkMode
                ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 text-white shadow-red-500/25"
                : "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 text-white shadow-red-200"
            }`}
          >
            <RotateCcw className="h-5 w-5" />
            Try Again
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
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </button>
        </div>

        <p
          className={`mt-6 text-sm ${
            isDarkMode ? "text-slate-500" : "text-gray-400"
          }`}
        >
          Auto redirect in{" "}
          <span
            className={`font-bold ${
              isDarkMode ? "text-red-400" : "text-red-500"
            }`}
          >
            {countdown}s
          </span>
        </p>
      </div>
    </div>
  );
};

export default PaymentFail;
