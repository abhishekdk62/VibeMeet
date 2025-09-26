import React, { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { signIn, signUp } from "../services/userServices";
import toast from "react-hot-toast";
import { User, Settings, LogOut, UserCircle } from "lucide-react";

const AccountModal = ({ onClose, onLogout, getUserMeetings }) => {
  const modalRef = useRef(null);
  const [mode, setMode] = useState("signin"); // 'signin' or 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if user is logged in (token exists)
  const isLoggedIn = !!localStorage.getItem("token");
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  // Helper functions for user display
  const getDisplayName = () => {
    if (!user) return "User";
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return fullName || user.email || "User";
  };

  const getInitial = () => {
    if (!user) return null;
    if (user.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return null;
  };

  const getUserEmail = () => {
    return user?.email || "No email";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logout successful");

    if (onLogout) onLogout();
    onClose();
  };

  const handleGoogleSignInSuccess = (credentialResponse) => {
    console.log("Google Sign-In Success:", credentialResponse);
    toast.success("Google sign-in successful");
    onClose();
  };

  const handleGoogleSignInError = () => {
    console.log("Google Sign-In Failed");
    toast.error("Google sign-in failed");
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

    if (mode === "signup" && (!firstName.trim() || !lastName.trim())) {
      setError("First name and last name are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data =
        mode === "signup"
          ? await signUp({
              email: email.trim(),
              password,
              firstName: firstName.trim(),
              lastName: lastName.trim(),
            })
          : await signIn({ email: email.trim(), password });

      console.log(`${mode} success`, data);

      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success(
          `${mode === "signup" ? "Account created" : "Sign in"} successful`
        );
        onClose();
      } else {
        throw new Error("No access token received");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Something went wrong";
      toast.error(errorMessage);
      console.error(err);
      setError(errorMessage);
    } finally {
      getUserMeetings();
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit();
    }
  };

  // If user is logged in, show user dropdown
  if (isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-start justify-end min-h-screen pt-16 pr-6">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl border border-gray-200 w-64 py-2 animate-in slide-in-from-top-2 duration-200"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium shadow-sm">
                  {getInitial() ? (
                    <span className="text-sm font-semibold">
                      {getInitial()}
                    </span>
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {getUserEmail()}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Options */}
            <div className="py-2">
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3">
                <UserCircle size={16} className="text-gray-500" />
                <span>Profile</span>
              </button>

              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3">
                <Settings size={16} className="text-gray-500" />
                <span>Settings</span>
              </button>

              <div className="border-t border-gray-100 my-2"></div>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-3"
              >
                <LogOut size={16} className="text-red-500" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: show sign-in/sign-up form modal
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/20 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-full max-w-md relative animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            {mode === "signup" ? "Create Account" : "Welcome Back"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-200 p-1"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="First Name"
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Last Name"
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
            </div>
          )}

          <input
            type="email"
            placeholder="Email address"
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full bg-blue-600 text-white rounded-lg px-4 py-2.5 font-medium transition-all duration-200 ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>
                  {mode === "signup" ? "Creating Account..." : "Signing In..."}
                </span>
              </div>
            ) : mode === "signup" ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>

          {/* Uncomment if you want Google OAuth */}
          {/* 
          <div className="flex items-center my-4">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="mx-3 text-gray-500 text-sm">OR</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSignInSuccess}
              onError={handleGoogleSignInError}
              size="medium"
              theme="outline"
              text="signin_with"
              width="100%"
            />
          </div>
          */}

          {/* Toggle Mode */}
          <div className="text-center pt-4 border-t border-gray-100">
            {mode === "signin" ? (
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setMode("signup");
                    setError("");
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium focus:outline-none transition-colors duration-200"
                  disabled={loading}
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setMode("signin");
                    setError("");
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium focus:outline-none transition-colors duration-200"
                  disabled={loading}
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountModal;
