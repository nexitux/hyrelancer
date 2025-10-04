"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout, updateUserProfile, mobileVerified, updateOnlineStatus } from "@/redux/slices/authSlice";
import {
  Menu as MenuIcon,
  User,
  Layers,
  Megaphone,
  Brush,
  Camera,
  Image as ImageIcon,
  ChevronDown,
  Settings,
  LogOut,
  Shield,
  MessageCircle,
  Bell,
  Wifi,
  WifiOff,
} from "lucide-react";
import Logo from "../../../../public/images/image.png";
import Image from "next/image";
import api, { freelancerJobAPI } from "@/config/api";
import PhoneVerificationModal from "../../registration/Header/components/PhoneVerificationModal";

// Default category icons mapping
const defaultCategoryIcons = {
  "Web Development": <Layers className="w-5 h-5" />,
  "Design": <Brush className="w-5 h-5" />,
  "Marketing": <Megaphone className="w-5 h-5" />,
  "Photography": <Camera className="w-5 h-5" />,
  "Writing": <ImageIcon className="w-5 h-5" />,
  // Add more categories as needed
};

const Header = ({ params }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(null);
  const [isTabletView, setIsTabletView] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user, slug, token, isAuthenticated, isOnline } = useSelector(state => state.auth);
  console.log("Redux user session:", {
    user: user,
    isAuthenticated: isAuthenticated,
    token: !!token,
    slug: slug,
    localStorageToken: typeof window !== 'undefined' ? !!localStorage.getItem('token') : 'SSR',
    localStorageUser: typeof window !== 'undefined' ? !!localStorage.getItem('user') : 'SSR'
  });

  useEffect(() => {
    // Check if we have a token but user data is incomplete
    if (token && user && (!user.name || !user.email || !user.user_type)) {
      const rawUserData = localStorage.getItem('user');
      if (rawUserData) {
        try {
          const parsedUser = JSON.parse(rawUserData);
          // Dispatch an action to update the user data
          dispatch(updateUserProfile(parsedUser));
        } catch (error) {
          console.log("Error parsing user data:", error);
        }
      }
    }
  }, [token, user, dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/getSiteData");
        const { ca_list, sc_list, se_list } = response.data;

        // Transform API data to match the expected category structure
        const transformedCategories = ca_list.map((ca) => {
          // Get subcategories for this category
          const categorySubcategories = sc_list.filter(
            (sc) => sc.sc_ca_id === ca.ca_id
          );

          // Transform subcategories to the expected format
          const subcategories = categorySubcategories.map((sc) => {
            // Get services for this subcategory
            const services = se_list.filter((se) => se.se_sc_id === sc.sc_id);

            return {
              title: sc.sc_name,
              items: services.map((service) => service.se_name),
            };
          });

          return {
            id: ca.ca_id.toString(),
            name: ca.ca_name,
            icon: defaultCategoryIcons[ca.ca_name] || (
              <Layers className="w-5 h-5" />
            ),
            subcategories: subcategories,
          };
        });

        setCategories(transformedCategories);
        if (transformedCategories.length > 0) {
          setSelectedCategory(transformedCategories[0]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsTabletView(window.innerWidth <= 1000);
    };

    // Set initial value
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".category-dropdown")) {
        setShowDropdown(false);
      }
      if (!event.target.closest(".user-dropdown")) {
        setShowUserDropdown(false);
      }
      if (!event.target.closest(".notification-dropdown")) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rawUserData = localStorage.getItem('user');
      console.log("Raw localStorage user data:", rawUserData);

      if (rawUserData) {
        try {
          const parsedUser = JSON.parse(rawUserData);
          console.log("Parsed localStorage user:", parsedUser);
        } catch (error) {
          console.log("Error parsing user data:", error);
        }
      }
    }
  }, []);

  const toggleMobileCategory = (id) => {
    setMobileCategoryOpen(mobileCategoryOpen === id ? null : id);
  };

  const navigationItems = [
    { name: "Explore Hyrelancer" },
    { name: "For Service Providers" },
    { name: "Contact Us" },
  ];

  const shouldShowUserDropdown =
    isAuthenticated &&
    pathname !== "/Login" &&
    pathname !== "/login" &&
    pathname !== "/Register" &&
    pathname !== "/register";

  const shouldShowLoginButton = !shouldShowUserDropdown && 
    pathname !== "/Login" && 
    pathname !== "/login" && 
    pathname !== "/Register" && 
    pathname !== "/register";

  // Check if mobile number is verified
  const isMobileVerified = user?.mobile_verified_at && user.mobile_verified_at !== null;

  const handleVerifyPhone = () => {
    setShowVerificationModal(true);
  };

  const handleVerificationSuccess = () => {
    // Update Redux state with mobile verification timestamp
    dispatch(mobileVerified({ timestamp: new Date().toISOString() }));
    setShowVerificationModal(false);
  };

  const handleMessageClick = () => {
    const userType = user?.user_type;
    if (userType === "Customer" || userType === "customer") {
      router.push("/customer-dashboard/message");
    } else if (userType === "Freelancer" || userType === "freelancer") {
      router.push("/freelancer-dashboard/message");
    }
  };

  const handleOnlineToggle = async () => {
    try {
      const newStatus = !isOnline;
      const userId = user?.id;
      
      if (!userId) {
        console.error("User ID not found");
        return;
      }

      // Update Redux state immediately for better UX
      dispatch(updateOnlineStatus(newStatus));
      
      // Call API to update availability status
      await freelancerJobAPI.updateAvailability(userId, newStatus);
      
      console.log(`Freelancer availability updated to: ${newStatus ? 'Online' : 'Offline'}`);
    } catch (error) {
      console.error("Error updating availability status:", error);
      // Revert Redux state on error
      dispatch(updateOnlineStatus(!newStatus));
    }
  };

  const getMessagePath = () => {
    const userType = user?.user_type;
    if (userType === "Customer" || userType === "customer") {
      return "/customer-dashboard/message";
    } else if (userType === "Freelancer" || userType === "freelancer") {
      return "/freelancer-dashboard/message";
    }
    return "/";
  };

  // Sample notification data - replace with actual API call
  const notifications = [
    {
      id: 1,
      title: "New Message",
      message: "You have a new message from John Doe",
      time: "2 minutes ago",
      isRead: false,
    },
    {
      id: 2,
      title: "Job Application",
      message: "Your application for 'Web Development' was accepted",
      time: "1 hour ago",
      isRead: true,
    },
    {
      id: 3,
      title: "Payment Received",
      message: "Payment of ₹5,000 has been received",
      time: "3 hours ago",
      isRead: true,
    },
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Check if user is freelancer
  const isFreelancer = user?.user_type === "Freelancer" || user?.user_type === "freelancer";

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

      // Close the dropdown
      setShowUserDropdown(false);

      // Redirect to login page
      router.push("/Login");
    }
  };

  // Get the correct dashboard path based on user type
  const getDashboardPath = () => {
    const userType = user?.user_type;
    
    if (userType === "Customer" || userType === "customer") {
      return "/customer-dashboard";
    } else if (userType === "Freelancer" || userType === "freelancer") {
      return "/freelancer-dashboard";
    }
    
    // Default fallback
    return "/";
  };

  // Get user menu items based on user type
  const getUserMenuItems = () => {
    const userType = user?.user_type;
    const isCustomer = userType === "Customer" || userType === "customer";
    
    const baseItems = [
      {
        name: "Dashboard",
        icon: <Layers className="w-4 h-4" />,
        onClick: () => {
          router.push(getDashboardPath());
          setShowUserDropdown(false);
        },
      },
    ];

    // Only add "My Profile" for non-customer users
    if (!isCustomer) {
      baseItems.push({
        name: "My Profile",
        icon: <Settings className="w-4 h-4" />,
        onClick: () => {
          const profileSlug = slug || user?.slug;
          router.push(`/profileView/${profileSlug}`);
          setShowUserDropdown(false);
        },
      });
    }

    // Always add logout
    baseItems.push({
      name: "Logout",
      icon: <LogOut className="w-4 h-4" />,
      onClick: handleLogout,
    });

    return baseItems;
  };

  const userMenuItems = getUserMenuItems();

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white text-black shadow-md" : "bg-[#3e5a9a] text-white"
        }`}
    >
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <MenuIcon className="w-6 h-6" />
          </button>

          {/* Logo and Categories Button (grouped together) */}
          <div
            className="flex items-center space-x-4 cursor-pointer"
            onClick={() => router.push("/")}
            role="button"
            tabIndex={0}
            aria-label="Go to home page"
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") {
                router.push("/");
              }
            }}
          >
            <Image
              src={Logo}
              alt="Hyrelancer Logo"
              className="w-32 md:w-40 h-auto"
              priority
            />
          </div>
          {/* User Dropdown and Verification Button - Only show if authenticated and not on login/register pages */}
          {shouldShowUserDropdown && (
            <div className="flex items-center space-x-3">
              {/* Message Button */}
              <button
                onClick={handleMessageClick}
                className={`flex items-center space-x-2 p-2 rounded-full transition-colors duration-200 ${isScrolled
                  ? "hover:bg-gray-100 text-gray-700"
                  : "hover:bg-white/10 text-white"
                  }`}
                title="Messages"
              >
                <MessageCircle className="w-5 h-5" />
              </button>

              {/* Notification Button with Dropdown */}
              <div className="relative notification-dropdown">
                <button
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                  className={`flex items-center space-x-2 p-2 rounded-full transition-colors duration-200 relative ${isScrolled
                    ? "hover:bg-gray-100 text-gray-700"
                    : "hover:bg-white/10 text-white"
                    }`}
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown Menu */}
                {showNotificationDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    </div>
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 transition-colors duration-150 ${
                            !notification.isRead ? "bg-blue-50 border-l-4 border-blue-500" : ""
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Online/Offline Toggle - Only for Freelancers */}
              {isFreelancer && (
                <button
                  onClick={handleOnlineToggle}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isOnline
                    ? isScrolled
                      ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                      : "bg-green-500 text-white hover:bg-green-600"
                    : isScrolled
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                    : "bg-gray-500 text-white hover:bg-gray-600"
                    }`}
                  title={isOnline ? "Go Offline" : "Go Online"}
                >
                  {isOnline ? (
                    <Wifi className="w-4 h-4" />
                  ) : (
                    <WifiOff className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </button>
              )}

              {/* Mobile Verification Button - Only show if mobile is not verified */}
              {!isMobileVerified && (
                <button
                  onClick={handleVerifyPhone}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isScrolled
                    ? "bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                    }`}
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Verify Phone</span>
                </button>
              )}

              {/* User Dropdown */}
              <div className="relative user-dropdown">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className={`flex items-center space-x-2 p-2 rounded-full transition-colors duration-200 ${isScrolled
                    ? "hover:bg-gray-100 text-gray-700"
                    : "hover:bg-white/10 text-white"
                    }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${isScrolled
                      ? "border-gray-300 bg-gray-50"
                      : "border-white/30 bg-white/10"
                      }`}
                  >
                    <User className="w-4 h-4" />
                  </div>

                  <span className="hidden sm:inline-block text-sm font-medium truncate max-w-[10rem]">
                    {`Hi, ${user?.name ||
                      user?.username ||
                      user?.slug ||
                      slug ||
                      `User${user?.id}` ||
                      "User"
                      }`}
                  </span>

                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${showUserDropdown ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* User Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {userMenuItems.map((item, index) => (
                      <button
                        key={item.name}
                        onClick={item.onClick}
                        className={`w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors duration-150 ${index === userMenuItems.length - 1
                          ? "text-red-600 hover:bg-red-50"
                          : ""
                          }`}
                      >
                        <span
                          className={
                            index === userMenuItems.length - 1
                              ? "text-red-600"
                              : "text-gray-400"
                          }
                        >
                          {item.icon}
                        </span>
                        <span className="text-sm font-medium">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Show Login button when not authenticated or on login/register pages */}
          {shouldShowLoginButton && (
            <button
              onClick={() => router.push("/Login")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors duration-200 ${isScrolled
                  ? "bg-[#3e5a9a] text-white hover:bg-[#2d4370]"
                  : "bg-white text-[#3e5a9a] hover:bg-gray-100"
                }`}
            >
              <User className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile/Tablet Menu (shown on mobile and tablet) */}
      <div
        className={`fixed inset-0 z-40 overflow-y-auto transition-all duration-300 ease-in-out transform ${isMobileMenuOpen
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
          } ${isScrolled ? "bg-white" : "bg-[#3e5a9a]"}`}
        style={{
          top: "64px", // Height of the header
          height: "calc(100vh - 64px)",
          display: isMobileMenuOpen ? "block" : "none",
        }}
      >
        <div className="px-4 py-4 space-y-2">
          {/* Mobile Categories */}
          <div className="border-b pb-2">
            <h3 className="font-bold text-lg mb-2">Categories</h3>
            {!loading &&
              categories.map((category) => (
                <div key={category.id} className="mb-1">
                  <button
                    onClick={() => toggleMobileCategory(category.id)}
                    className={`w-full flex justify-between items-center px-3 py-2 rounded-md ${isScrolled ? "hover:bg-gray-100" : "hover:bg-[#4c6aa6]"
                      }`}
                  >
                    <div className="flex items-center">
                      <div className="mr-3">{category.icon}</div>
                      <span>{category.name}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${mobileCategoryOpen === category.id ? "rotate-180" : ""
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {mobileCategoryOpen === category.id && (
                    <div className="pl-8 mt-1 space-y-1">
                      {category.subcategories.map((sub) => (
                        <div key={sub.title} className="mb-2">
                          <h4 className="font-medium mb-1">{sub.title}</h4>
                          <ul className="space-y-1 pl-2">
                            {sub.items.map((item) => (
                              <li key={item}>
                                <a
                                  href="#"
                                  className={`block py-1 text-sm ${isScrolled
                                    ? "text-gray-700 hover:text-[#3e5a9a]"
                                    : "text-gray-200 hover:text-white"
                                    }`}
                                >
                                  {item}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Mobile Navigation Items */}
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href="#"
                className={`block px-3 py-2 rounded-md font-medium ${isScrolled ? "hover:bg-gray-100" : "hover:bg-[#4c6aa6]"
                  }`}
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Mobile Buttons */}
          <button
            className={`w-full px-4 py-3 rounded-md font-bold my-4 ${isScrolled
              ? "bg-[#3e5a9a] text-white hover:bg-[#2d4370]"
              : "bg-white text-[#3e5a9a] hover:bg-gray-100"
              }`}
          >
            Become A Service Provider
          </button>

          {/* Mobile Action Buttons - Only show if authenticated */}
          {shouldShowUserDropdown && (
            <div className="space-y-2 pt-2 border-t">
              {/* Message Button */}
              <button
                onClick={() => {
                  handleMessageClick();
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md ${
                  isScrolled ? "hover:bg-gray-100" : "hover:bg-[#4c6aa6]"
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Messages</span>
              </button>

              {/* Notification Button */}
              <button
                onClick={() => {
                  setShowNotificationDropdown(!showNotificationDropdown);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md relative ${
                  isScrolled ? "hover:bg-gray-100" : "hover:bg-[#4c6aa6]"
                }`}
              >
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Online/Offline Toggle - Only for Freelancers */}
              {isFreelancer && (
                <button
                  onClick={() => {
                    handleOnlineToggle();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md ${
                    isOnline
                      ? isScrolled
                        ? "bg-green-100 text-green-700"
                        : "bg-green-500 text-white"
                      : isScrolled
                      ? "bg-gray-100 text-gray-700"
                      : "bg-gray-500 text-white"
                  }`}
                >
                  {isOnline ? (
                    <Wifi className="w-5 h-5" />
                  ) : (
                    <WifiOff className="w-5 h-5" />
                  )}
                  <span>{isOnline ? "Online" : "Offline"}</span>
                </button>
              )}
            </div>
          )}

          {shouldShowLoginButton && (
            <div className="pt-2 border-t">
              <button
                onClick={() => {
                  router.push("/Login");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2 w-full px-3 py-2 rounded-md ${
                  isScrolled ? "hover:bg-gray-100" : "hover:bg-[#4c6aa6]"
                }`}
              >
                <User className="w-5 h-5" />
                <span>Login</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Phone Verification Modal */}
      <PhoneVerificationModal 
        isOpen={showVerificationModal} 
        onClose={() => setShowVerificationModal(false)}
        onSuccess={handleVerificationSuccess}
      />
    </header>
  );
};

export default Header;
