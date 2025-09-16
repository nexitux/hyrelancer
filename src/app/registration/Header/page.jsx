"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/slices/authSlice";
import { LogOut } from "lucide-react";
import Logo from "../../../../public/images/image.png";
import Image from "next/image";
import Banner from "./components/Banner";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(logout());
    router.push("/Login");
  };

  return (
    <>
      {/* Banner above header */}
      <Banner
        title="Complete Your Profile"
        subtitle="Fill all sections to start receiving job opportunities"
      />

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white text-black shadow-md"
            : "bg-[#3e5a9a] text-white"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Image
                src={Logo}
                alt="Hyrelancer Logo"
                className="w-32 md:w-40"
                priority
              />
            </div>

            {/* Logout Button */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                  isScrolled
                    ? "bg-[#3e5a9a] text-white hover:bg-[#2d4370]"
                    : "bg-white text-[#3e5a9a] hover:bg-gray-100"
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
  
export default Header;
