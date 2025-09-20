"use client";

import { useState, useEffect } from "react";
import { Trash2, Phone, Shield, ArrowLeft, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "../../../../redux/slices/authSlice";
import api from "../../../../config/api";

export default function DeleteProfile() {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null);
  
  const router = useRouter();
  const dispatch = useDispatch();

  // Logout function
  const handleLogout = async () => {
    try {
      // Call backend logout API
      await api.post("/logout");
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with logout process even if API call fails
    } finally {
      // Always clear local data and Redux state
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Dispatch Redux logout action to clear the store
      dispatch(logout());

      // Redirect to login page
      router.push("/Login");
    }
  };

 
 

  // Step 1: Send OTP
  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Enter a valid phone number.");
      return;
    }
    setLoading(true); setError("");

    try {
      const response = await api.post("/delete/send-otp");
      const data = response.data;
      console.log("Send OTP Response:", data); // Debug log
      
      // Check for success - your backend returns status: 1 for SMS success
      if (data.status === 1 || data.status === "success" || response.status === 200) {
        setOtpSent(true);
        setStep(2);
        setError(""); // Clear any previous errors
      } else {
        setError(data.message || data.remark || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Send OTP Error:", err);
      console.error("Error Response:", err.response?.data);
      setError(err.response?.data?.message || "Network error. Try again.");
    } finally { setLoading(false); }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { setError("Enter the 6-digit OTP"); return; }
    setLoading(true); setError("");

    try {
      const response = await api.post("/delete/verify-otp", {
        mobile: phoneNumber,
        otp: otp
      });
      const data = response.data;
      console.log("Verify OTP Response:", data); // Debug log
      
      if (data.status === "success" || response.status === 200) {
        setStep(3);
        setError(""); // Clear any previous errors
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("Verify OTP Error:", err);
      console.error("Error Response:", err.response?.data);
      setError(err.response?.data?.message || "Network error. Try again.");
    } finally { setLoading(false); }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setLoading(true); setError("");
    try {
      const response = await api.post("/delete/reset-otp", {
        mobile: phoneNumber
      });
      const data = response.data;
      if (data.status === 1) {
        alert("OTP resent successfully!");
      } else {
        setError(data.message || data.remark || "Failed to resend OTP");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Network error. Try again.");
    } finally { setLoading(false); }
  };

  // Step 3: Confirm Account Deletion
  const handleConfirmDelete = async () => {
    setLoading(true); setError("");
    try {
      const response = await api.post("/delete/deleteAccount");
      const data = response.data;
      if (data.status === "success") {
        alert(data.message || "Account deleted successfully!");
        // Logout user after successful account deletion
        await handleLogout();
      } else {
        setError(data.message || "Failed to delete account");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Network error. Try again.");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  // Go back button
  const goBack = () => {
    if (step === 2) { setStep(1); setOtp(""); }
    else if (step === 3) { setStep(2); }
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-7xl mx-auto">

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">{error}</div>}

        <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
          {/* Header */}
          <div className="px-8 py-10 text-center bg-gradient-to-br from-blue-600 to-indigo-700">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
              <Trash2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Delete Account</h1>
            <p className="text-blue-100 text-base">Secure account deletion process</p>
          </div>

          {/* Step Indicator */}
          <div className="px-8 py-4 bg-gray-50 border-b">
            <div className="flex items-center justify-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>1</div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>2</div>
              <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>3</div>
            </div>
            <div className="text-center mt-2 text-sm text-gray-600">
              Step {step} of 3: {step === 1 ? 'Verify Phone' : step === 2 ? 'Enter OTP' : 'Confirm Deletion'}
            </div>
          </div>

          {/* Steps */}
          <div className="px-8 py-10 max-w-4xl mx-auto">
            {step === 1 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ backgroundColor: "#3d5999" }}>
                    <Phone className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Phone</h2>
                  <p className="text-gray-600">We'll send a 6-digit code to confirm your identity</p>
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 1234567890"
                  className="w-full px-5 py-4 border-2 border-blue-100 rounded-2xl focus:ring-2 focus:border-blue-300 transition-all duration-200 bg-blue-50/30 text-lg"
                  disabled={userData?.mobile}
                />
                <button
                  onClick={handleSendOTP}
                  disabled={loading || !phoneNumber}
                  className="w-full text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  style={{ backgroundColor: loading || !phoneNumber ? "#94a3b8" : "#3d5999" }}
                >
                  {loading ? "Sending OTP..." : "Send Verification Code"}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <button onClick={goBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors font-medium">
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ backgroundColor: "#3d5999" }}>
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter Verification Code</h2>
                  <p className="text-gray-600">Code sent to <span className="font-semibold" style={{ color: "#3d5999" }}>{phoneNumber}</span></p>
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  className="w-full px-5 py-4 border-2 border-blue-100 rounded-2xl focus:ring-2 focus:border-blue-300 text-center text-2xl font-bold tracking-widest bg-blue-50/30"
                  maxLength={6}
                />
                <div className="flex gap-4">
                  <button onClick={handleResendOTP} disabled={loading} className="flex-1 bg-blue-50 border-2 border-blue-200 text-gray-700 py-3 px-4 rounded-2xl font-semibold hover:bg-blue-100 transition-all duration-200 text-sm">
                    {loading ? "Resending..." : "Resend Code"}
                  </button>
                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length !== 6}
                    className="flex-1 text-white py-3 px-4 rounded-2xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                    style={{ backgroundColor: loading || otp.length !== 6 ? "#94a3b8" : "#3d5999" }}
                  >
                    {loading ? "Verifying..." : "Verify & Continue"}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <button onClick={goBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors font-medium">
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-200">
                    <AlertTriangle className="w-10 h-10 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Final Confirmation</h2>
                  <p className="text-gray-600 text-base mb-4 leading-relaxed">You're about to permanently delete your account</p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left mt-6">
                    <h3 className="font-semibold text-red-800 mb-2">⚠️ Important Notice</h3>
                    <p className="text-red-700 text-sm">
                      Your account will be deactivated immediately. You can request reactivation within 3 months by contacting the admin.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-200">Cancel</button>
                  <button onClick={() => setShowDeleteModal(true)} className="flex-1 bg-red-600 text-white py-3 px-4 rounded-2xl font-semibold hover:bg-red-700 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">Delete Account</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Confirm Account Deletion</h3>
              <p className="text-gray-600 mb-6 text-center">Are you sure you want to permanently delete your account?</p>
              <div className="flex gap-4">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-gray-100 border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-200">Cancel</button>
                <button onClick={handleConfirmDelete} disabled={loading} className="flex-1 bg-red-600 text-white py-3 px-4 rounded-2xl font-semibold hover:bg-red-700 hover:shadow-lg disabled:bg-red-400 disabled:cursor-not-allowed transition-all duration-200">
                  {loading ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-10">
          <p className="text-gray-500 text-sm font-medium">©2024 Hyrelancer. All Rights Reserved</p>
        </div>
      </div>
    </div>
  );
}
