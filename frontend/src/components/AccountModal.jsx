import React, { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { signIn, signUp } from "../services/userServices";

const AccountModal = ({ onClose, onLogout }) => {
  const modalRef = useRef(null);
  const [mode, setMode] = useState("signin"); // 'signin' or 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Check if user is logged in (token exists)
  const isLoggedIn = !!localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (onLogout) onLogout();
    setShowDropdown(false);
    onClose();
  };

  const handleGoogleSignInSuccess = (credentialResponse) => {
    console.log("Google Sign-In Success:", credentialResponse);
    onClose();
  };

  const handleGoogleSignInError = () => {
    console.log("Google Sign-In Failed");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const data =
        mode === "signup"
          ? await signUp({ email, password, firstName, lastName })
          : await signIn({ email, password });

      console.log(`${mode} success`, data);
      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      onClose();
    } catch (err) {
      alert(err.response.data.message)
      console.log(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn) {
    // Show compact user panel with buttons
    const initial = user.firstName
      ? user.firstName.charAt(0).toUpperCase()
      : user.email
      ? user.email.charAt(0).toUpperCase()
      : "A";

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-start justify-end min-h-screen pt-16 pr-6">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl border border-gray-200 w-64 py-2"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-medium">
                  {initial}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Google Sign-In Button
            <div className="px-4 py-3 border-b border-gray-100">
              <GoogleLogin
                onSuccess={handleGoogleSignInSuccess}
                onError={handleGoogleSignInError}
                text="signin_with"
                theme="outline"
                size="medium"
              />
            </div> */}

            {/* Menu Options */}
            <div className="py-2">
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Profile
                </div>
              </button>

              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Settings
                </div>
              </button>

              <div className="border-t border-gray-100 my-2"></div>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Sign out
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // default show sign-in/sign-up form modal
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/20 bg-opacity-50 flex items-center justify-center">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-96 max-w-full relative"
      >
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {mode === "signup" ? "Sign Up" : "Sign In"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            X
          </button>
        </div>

        {mode === "signup" && (
          <>
            <input
              type="text"
              placeholder="First Name"
              className="border rounded p-2 w-full mb-3"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Last Name"
              className="border rounded p-2 w-full mb-3"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={loading}
            />
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          className="border rounded p-2 w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          className="border rounded p-2 w-full mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        {error && <p className="text-red-600 mb-2">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`bg-blue-600 text-white rounded px-4 py-2 w-full mb-4 hover:bg-blue-700 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading
            ? mode === "signup"
              ? "Creating..."
              : "Signing in..."
            : mode === "signup"
            ? "Create Account"
            : "Sign In"}
        </button>
{/* 
        <div className="flex items-center my-4">
          <hr className="flex-grow border-t mr-2" />
          <span className="text-gray-600">OR</span>
          <hr className="flex-grow border-t ml-2" />
        </div>

        <GoogleLogin
          onSuccess={handleGoogleSignInSuccess}
          onError={handleGoogleSignInError}
          size="medium"
          theme="outline"
          text="signin_with"
        /> */}

        <div className="mt-4 text-center">
          {mode === "signin" ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-blue-600 hover:underline focus:outline-none"
                disabled={loading}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("signin")}
                className="text-blue-600 hover:underline focus:outline-none"
                disabled={loading}
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountModal;
