// app/(freelancer)/layout.jsx
'use client';
import "../../styles/globals.css";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Spin } from "antd";

import Sidebar from "@/components/sidebar/Sidebar";
import { freelancerMenu } from "@/components/sidebar/freelancerMenu";
import Header from "../(public)/Header/page";
import Footer from "../(public)/Footer/page";
import Loader from "../../components/Loader/page";

export default function FreelancerLayout({ children, showSidebar = true }) {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace('/Login');
      return;
    }

    const { is_regi_complete, is_status } = user;

    // Only redirect to registration if user is new AND has incomplete registration
    if (is_status === "new" && is_regi_complete > 0) {
      console.log("New user with incomplete registration → redirecting to registration");
      router.replace("/registration/profile-setup");
      return;
    }

    // Allow access for:
    // 1. Old users (is_status === "old")
    // 2. New users with completed registration (is_status === "new" && is_regi_complete === 0)
    setIsChecking(false);
  }, [user, router]);

  // Show loading while checking registration status
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader />
          <p className="text-gray-600 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Center Section: Sidebar + Content */}
      <div className="flex flex-1">
        {showSidebar && (
          <div className="border-r border-gray-200 bg-white">
            <Sidebar navItems={freelancerMenu} />
          </div>
        )}

        {/* Main content area with footer */}
        <div className="flex flex-col flex-1">
          {/* Main content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            {children}
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
}