import axiosClient from "./axiosClient";
import tokenManager from "./tokenManager";

const LOGIN_ENDPOINT = "/api/v1/identity/auth/login";
const REGISTER_ENDPOINT = "/api/v1/identity/users/register";
const LOGOUT_ENDPOINT = "/api/v1/identity/auth/logout";
const INTROSPECT_ENDPOINT = "/api/v1/identity/auth/introspect";
const REFRESH_ENDPOINT = "/api/v1/identity/auth/refresh-token";

// Forgot Password Endpoints
const CHECK_EMAIL_ENDPOINT = "/api/v1/identity/users/check-email";
const FORGOT_PASSWORD_ENDPOINT = "/api/v1/identity/users/forgot-password";
const VALIDATE_RESET_TOKEN_ENDPOINT =
  "/api/v1/identity/users/validate-reset-token";
const RESET_PASSWORD_ENDPOINT = "/api/v1/identity/users/reset-password";

const extractToken = (response) =>
  response?.data?.result?.accessToken ||
  response?.data?.data?.accessToken ||
  response?.data?.accessToken ||
  response?.data?.token ||
  // For refresh endpoint which returns token directly in result
  (typeof response?.data?.result === "string" ? response?.data?.result : null);

export const authApi = {
  login: (usernameOrEmail, password) =>
    axiosClient
      .post(LOGIN_ENDPOINT, { usernameOrEmail, password })
      .then((response) => {
        const token = extractToken(response);
        if (token) {
          // Store in memory instead of localStorage
          tokenManager.setToken(token);
        }
        return response;
      }),

  register: (payload) => axiosClient.post(REGISTER_ENDPOINT, payload),

  logout: () => {
    // Clear token from memory
    tokenManager.clearToken();
    return axiosClient.get(LOGOUT_ENDPOINT);
  },

  introspect: () => axiosClient.get(INTROSPECT_ENDPOINT),

  // Refresh token - get new access token using HttpOnly cookie
  refreshToken: () =>
    axiosClient.get(REFRESH_ENDPOINT).then((response) => {
      const token = extractToken(response);
      if (token) {
        tokenManager.setToken(token);
      }
      return response;
    }),

  // ==================== FORGOT PASSWORD API ====================

  /**
   * Check if email exists and is verified for password reset
   * @param {string} email - The email to check
   * @returns {Promise} - Response with exists and verified status
   */
  checkEmail: (email) => axiosClient.post(CHECK_EMAIL_ENDPOINT, { email }),

  /**
   * Request a password reset email
   * @param {string} email - The email to send reset link to
   * @returns {Promise} - Response indicating if email was sent
   */
  forgotPassword: (email) =>
    axiosClient.post(FORGOT_PASSWORD_ENDPOINT, { email }),

  /**
   * Validate a password reset token
   * @param {string} token - The reset token from the URL
   * @returns {Promise} - Response with token validity and email
   */
  validateResetToken: (token) =>
    axiosClient.post(VALIDATE_RESET_TOKEN_ENDPOINT, { token }),

  /**
   * Reset password using a valid token
   * @param {string} token - The reset token
   * @param {string} newPassword - The new password
   * @param {string} confirmPassword - Confirm the new password
   * @returns {Promise} - Response indicating if password was reset
   */
  resetPassword: (token, newPassword, confirmPassword) =>
    axiosClient.post(RESET_PASSWORD_ENDPOINT, {
      token,
      newPassword,
      confirmPassword,
    }),
};
