"use client"
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  MdSearch,
  MdSettings,
  MdAccountCircle,
  MdKeyboardArrowDown,
  MdLogout,
  MdPerson,
  MdDarkMode,
  MdLightMode,
  MdMenu
} from 'react-icons/md';
import { logoutAdmin } from '@/redux/slices/adminSlice';
import NotificationDropdown from '@/components/NotificationDropdown';

export default function Header() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // LOGOUT handler (frontend-only)
  const handleLogout = () => {
    console.log('➡️ handleLogout called (desktop)'); // debug
    // clear redux state + localStorage via slice reducer
    dispatch(logoutAdmin());
    console.log('➡️ dispatched logoutAdmin, localStorage token:', localStorage.getItem('adminToken'));
    // close any open menus and navigate to gateway
    setShowProfileMenu(false);
    setShowMobileMenu(false);
    // use replace so back button doesn't return to protected page
    router.replace('/gateway');
  };


  return (
    <header className="flex relative z-50 justify-between items-center px-4 py-3 bg-white border-b shadow-sm md:px-6 border-slate-200">
      {/* Left Section - Logo / Title */}
      <div className="flex items-center space-x-3">
        {/* Mobile Menu Button */}
        <button
          className="p-2 rounded-lg md:hidden hover:bg-slate-100"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <MdMenu size={22} className="text-slate-700" />
        </button>

        <div>
          <h1 className="text-lg font-semibold md:text-xl text-slate-800">Super Admin Panel</h1>
          <p className="hidden text-xs sm:block md:text-sm text-slate-500">Dashboard / Overview</p>
        </div>
      </div>

      {/* Center Section - Search (hidden on mobile) */}
      <div className="hidden flex-1 mx-8 max-w-md md:flex">
        <div className="relative w-full">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search users, services, or transactions..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Theme Toggle */}
        {/* <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-lg transition-colors hover:bg-slate-100 text-slate-600 hover:text-slate-800"
        >
          {isDarkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
        </button> */}

        {/* Notifications */}
        <NotificationDropdown />

        {/* Profile Dropdown */}
        <div className="hidden relative sm:block">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center p-2 space-x-2 rounded-lg transition-colors md:space-x-3 hover:bg-slate-100"
          >
            <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full">
              <span className="text-sm font-semibold text-white">AD</span>
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-slate-800">Admin User</p>
              <p className="text-xs text-slate-500">Super Administrator</p>
            </div>
            <MdKeyboardArrowDown
              className={`text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}
              size={16}
            />
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div className="overflow-hidden absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border shadow-lg border-slate-200 z-50">
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full">
                    <span className="font-semibold text-white">AD</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Admin User</p>
                    {/* <p className="text-sm text-slate-500">admin@databerry.com</p> */}
                  </div>
                </div>
              </div>

              {/* <div className="py-2">
                <button className="w-full flex items-center space-x-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors text-slate-700">
                  <MdPerson size={18} />
                  <span className="text-sm">View Profile</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors text-slate-700">
                  <MdSettings size={18} />
                  <span className="text-sm">Account Settings</span>
                </button>
              </div> */}

              <div className="border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center px-4 py-3 space-x-3 w-full text-left text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
                >
                  <MdLogout size={18} />
                  <span className="text-sm font-medium cursor-pointer">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside handlers */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProfileMenu(false);
          }}
        />
      )}

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="absolute left-0 top-full z-50 w-full bg-white border-t shadow-md border-slate-200 md:hidden">
          <div className="p-4 space-y-3">
            <input
              type="text"
              placeholder="Search..."
              className="py-2 pr-3 pl-3 w-full rounded-lg border bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="flex items-center p-2 space-x-2 w-full rounded-lg hover:bg-slate-100 text-slate-700">
              <MdPerson size={18} />
              <span>Profile</span>
            </button>
            <button className="flex items-center p-2 space-x-2 w-full rounded-lg hover:bg-slate-100 text-slate-700">
              <MdSettings size={18} />
              <span>Settings</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center p-2 space-x-2 w-full text-red-600 rounded-lg hover:bg-red-50"
            >
              <MdLogout size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
