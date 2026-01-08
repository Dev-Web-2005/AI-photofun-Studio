import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { toast } from "../hooks/use-toast";
import LoadingScreen from "../components/common/LoadingScreen";
import axiosClient from "../api/axiosClient";
import SetPasswordModal from "../components/auth/SetPasswordModal";
import tokenManager from "../api/tokenManager";

const API_GATEWAY = import.meta.env.VITE_API_GATEWAY || "http://localhost:8888";

const FacebookLoadingPage = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState("");
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const hasCalledRef = useRef(false);

  useEffect(() => {
    if (hasCalledRef.current) {
      return;
    }
    hasCalledRef.current = true;

    const handleFacebookCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (!code) {
          console.error("No authorization code received from Facebook");
          navigate("/failure");
          return;
        }

        console.log("Processing Facebook authentication with code...");

        const authResponse = await fetch(
          `${API_GATEWAY}/api/v1/identity/auth/authentication-facebook?code=${code}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const authData = await authResponse.json();
        console.log("Auth response:", authData);

        if (!authResponse.ok) {
          const errorMessage =
            authData?.message || "Authentication request failed";
          throw new Error(errorMessage);
        }

        if (!authData.result?.success) {
          console.error("Backend reported authentication failure");
          navigate("/failure");
          return;
        }

        const accessToken = authResponse.headers.get("X-Access-Token");
        console.log("Access token received:", accessToken ? "Yes" : "No");

        if (accessToken) {
          tokenManager.setToken(accessToken);
          console.log("Access token stored in memory");
          console.log("Token length:", accessToken.length);

          try {
            await refreshUser();
          } catch (userErr) {
            console.warn(
              "Could not fetch user info, but token is valid:",
              userErr
            );
          }

          try {
            console.log("Calling check-login-by-facebook API...");
            const checkResponse = await axiosClient.get(
              "/api/v1/identity/users/check-login-by-facebook"
            );
            console.log(
              "✅ Check login by Facebook response:",
              checkResponse.data
            );
            console.log("   - Code:", checkResponse.data.code);
            console.log(
              "   - Result (isLoginByFacebook):",
              checkResponse.data.result
            );
            console.log("   - Message:", checkResponse.data.message);

            if (
              checkResponse.data.code === 1000 &&
              checkResponse.data.result === true
            ) {
              console.log("🔐 User needs to set password - showing modal");
              setShowSetPasswordModal(true);
              return;
            } else {
              console.log(
                "✅ User already set password or not Facebook login, proceeding to home"
              );
            }
          } catch (checkErr) {
            console.error("❌ Could not check Facebook login status:", checkErr);
            console.error(
              "   - Error details:",
              checkErr.response?.data || checkErr.message
            );
          }

          console.log("Facebook login successful! Redirecting to /home");
          toast({ title: "Login successful!" });
          navigate("/home");
        } else {
          console.error("No access token in response header");
          navigate("/failure");
        }
      } catch (err) {
        console.error("Facebook login error:", err);
        setError(
          err?.response?.data?.message || err?.message || "Facebook login failed"
        );
        setTimeout(() => {
          navigate("/failure");
        }, 2000);
      }
    };

    handleFacebookCallback();
  }, [navigate, refreshUser]);

  const handlePasswordSet = () => {
    console.log("Password set successfully, navigating to home");
    navigate("/home");
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Login Failed</h1>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">
            Redirecting to failure page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Processing Facebook Login
          </h1>
          <p className="text-gray-600">
            Please wait while we authenticate your account...
          </p>
          <div className="mt-4 flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
      
      {showSetPasswordModal && (
        <SetPasswordModal
          isOpen={showSetPasswordModal}
          onClose={() => setShowSetPasswordModal(false)}
          onPasswordSet={handlePasswordSet}
        />
      )}
    </>
  );
};

export default FacebookLoadingPage;
