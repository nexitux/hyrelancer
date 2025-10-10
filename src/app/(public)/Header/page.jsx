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
  CheckCircle2,
  Settings,
  LogOut,
  Shield,
  MessageCircle,
  Bell,
  Wifi,
  WifiOff,
} from "lucide-react";
import Logo from "../../../../public/images/hyrelancerMain.png";
import Image from "next/image";
import api, { freelancerJobAPI } from "@/config/api";
import PhoneVerificationModal from "../../registration/Header/components/PhoneVerificationModal";
import LogoutModal from "@/components/LogoutModal/LogoutModal";
import UserNotificationDropdown from "@/components/UserNotificationDropdown";

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
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(null);
  const [isTabletView, setIsTabletView] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
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
          if (transformedCategories[0].subcategories?.length > 0) {
            setSelectedSubcategory(transformedCategories[0].subcategories[0]);
          }
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
      setIsTabletView(window.innerWidth <= 1280);
      // Close mobile menu when switching to desktop
      if (window.innerWidth > 1280) {
        setIsMobileMenuOpen(false);
      }
    };

    // Set initial value
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideCategoryDropdown = event.target.closest(".category-dropdown");
      const clickedOnCategoryTrigger = event.target.closest(".categories-trigger");
      if (!clickedInsideCategoryDropdown && !clickedOnCategoryTrigger) {
        setShowDropdown(false);
      }
      if (!event.target.closest(".user-dropdown")) {
        setShowUserDropdown(false);
      }
      if (!event.target.closest(".notification-dropdown")) {
        setShowNotificationDropdown(false);
      }
    };

    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
        setShowUserDropdown(false);
        setShowNotificationDropdown(false);
      }
    };

    const handleScrollClose = () => setShowDropdown(false);

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeydown);
    window.addEventListener("scroll", handleScrollClose, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("scroll", handleScrollClose);
    };
  }, []);

  // Close dropdowns on route changes
  useEffect(() => {
    setShowDropdown(false);
    setShowUserDropdown(false);
    setShowNotificationDropdown(false);
  }, [pathname]);

  // Close mobile menu when clicking outside or pressing escape
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

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

  // Check if user is freelancer
  const isFreelancer = user?.user_type === "Freelancer" || user?.user_type === "freelancer";

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setShowUserDropdown(false);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
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

      // Close the modal
      setShowLogoutModal(false);
      setIsLoggingOut(false);

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
      onClick: handleLogoutClick,
    });

    return baseItems;
  };

  const userMenuItems = getUserMenuItems();

  return (
    <header className={`flex w-full h-16 sm:h-20 md:h-24 items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-24 py-3 sm:py-4 md:py-6 sticky top-0 z-50 transition-all duration-200 ${isScrolled ? 'bg-white/95 shadow-sm' : 'bg-[#ffffff80]'} backdrop-blur-xl border border-solid border-[#ffffff1a]`}>
      <div className="flex justify-between items-center w-full max-w-[1440px] mx-auto">
        {/* Left side - Mobile menu button and Logo */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-700 touch-manipulation"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <div className="relative w-6 h-6">
              <span className={`absolute top-1 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`absolute top-3 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`absolute top-5 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>

          {/* Logo */}
          <a
            href="/"
            aria-label="Hyrelancer Home"
            onClick={(e) => {
              e.preventDefault();
              router.push("/");
              setIsMobileMenuOpen(false);
            }}
            className="cursor-pointer flex-shrink-0"
          >
            <Image
              src={Logo}
              alt="Hyrelancer Logo"
              className="relative w-24 sm:w-28 md:w-32 lg:w-36 xl:w-40 h-auto"
              priority
            />
          </a>
        </div>

        {/* Center - Navigation - Only show when NOT authenticated */}
        {!isAuthenticated && (
          <nav
            className="hidden xl:flex items-center gap-4 xl:gap-6 2xl:gap-8"
            aria-label="Main navigation"
          >
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              aria-expanded={showDropdown}
              className="categories-trigger inline-flex h-10 lg:h-12 items-center gap-2 px-3 lg:px-4 xl:px-6 bg-[#3a599c2e] rounded-[32px] cursor-pointer hover:bg-[#3a599c40] active:bg-[#3a599c50] transition-colors touch-manipulation"
              aria-label="Categories menu"
            >
              <span className="font-semibold text-[#3a599c] text-xs lg:text-sm whitespace-nowrap">
                Categories
              </span>
            </button>

            {navigationItems.map((item, index) => (
              <a
                key={index}
                href={item.href || "#"}
                className="font-normal text-black text-xs lg:text-sm whitespace-nowrap hover:text-[#3a599c] transition-colors px-2 py-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
              >
                {item.name}
              </a>
            ))}
          </nav>
        )}

        {/* Right side - User actions */}
        <div className="hidden xl:flex items-center gap-1 xl:gap-2 2xl:gap-3">
              {/* User Dropdown and Verification Button - Only show if authenticated and not on login/register pages */}
          {shouldShowUserDropdown && (
            <div className="flex items-center gap-1 2xl:gap-2">
              {/* Message Button */}
              <button
                onClick={handleMessageClick}
                className="flex items-center p-1.5 lg:p-2 rounded-full transition-colors duration-200 hover:bg-gray-100 active:bg-gray-200 text-gray-700 touch-manipulation"
                title="Messages"
              >
                <MessageCircle className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>

              {/* Notification Button with Dropdown */}
              <div className="relative notification-dropdown">
                <button
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                  className="flex items-center p-1.5 lg:p-2 rounded-full transition-colors duration-200 relative hover:bg-gray-100 active:bg-gray-200 text-gray-700 touch-manipulation"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown Menu */}
                {showNotificationDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-72 lg:w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    </div>
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 transition-colors duration-150 ${!notification.isRead ? "bg-blue-50 border-l-4 border-blue-500" : ""
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
              {/* User Notification Dropdown */}
              <UserNotificationDropdown userType={user?.user_type?.toLowerCase()} />

              {/* Online/Offline Toggle - Only for Freelancers */}
              {isFreelancer && (
                <button
                  onClick={handleOnlineToggle}
                  className={`flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded-md text-xs lg:text-sm font-medium transition-colors duration-200 touch-manipulation ${isOnline
                      ? "bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-300 border border-green-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 border border-gray-200"
                    }`}
                  title={isOnline ? "Go Offline" : "Go Online"}
                >
                  {isOnline ? (
                    <Wifi className="w-3 h-3 lg:w-4 lg:h-4" />
                  ) : (
                    <WifiOff className="w-3 h-3 lg:w-4 lg:h-4" />
                  )}
                  <span className="hidden xl:inline">
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </button>
              )}

              {/* Mobile Verification Button - Only show if mobile is not verified */}
              {!isMobileVerified && (
                <button
                  onClick={handleVerifyPhone}
                  className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded-md text-xs lg:text-sm font-medium transition-colors duration-200 bg-orange-100 text-orange-700 hover:bg-orange-200 active:bg-orange-300 border border-orange-200 touch-manipulation"
                >
                  <Shield className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="hidden xl:inline">Verify Phone</span>
                </button>
              )}

              {/* User Dropdown */}
              <div className="relative user-dropdown">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-1 lg:gap-2 p-1.5 lg:p-2 rounded-full transition-colors duration-200 hover:bg-gray-100 active:bg-gray-200 text-gray-700 touch-manipulation"
                >
                  <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full border-2 flex items-center justify-center border-gray-300 bg-gray-50">
                    <User className="w-3 h-3 lg:w-4 lg:h-4" />
                  </div>

                  <span className="hidden xl:inline-block text-xs lg:text-sm font-medium truncate max-w-[6rem] 2xl:max-w-[8rem]">
                    {`Hi, ${user?.name ||
                      user?.username ||
                      user?.slug ||
                      slug ||
                      `User${user?.id}` ||
                      "User"
                      }`}
                  </span>

                  <ChevronDown
                    className={`w-3 h-3 lg:w-4 lg:h-4 transition-transform duration-200 ${showUserDropdown ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* User Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-44 lg:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {userMenuItems.map((item, index) => (
                      <button
                        key={item.name}
                        onClick={item.onClick}
                        className={`w-full flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 text-left text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150 touch-manipulation ${index === userMenuItems.length - 1
                          ? "text-red-600 hover:bg-red-50 active:bg-red-100"
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
                        <span className="text-xs lg:text-sm font-medium">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Show Login button when not authenticated or on login/register pages */}
          {shouldShowLoginButton && (
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                router.push("/Login");
              }}
              className="inline-flex h-10 lg:h-12 items-center justify-center px-3 lg:px-4 xl:px-6 rounded-3xl border border-solid border-[#3a599c] hover:bg-[#3a599c0a] active:bg-[#3a599c15] transition-colors touch-manipulation"
            >
              <span className="font-semibold text-[#3a599c] text-xs lg:text-sm whitespace-nowrap">
                Login
              </span>
            </a>
          )}

          {/* Become A Service Provider Button - Only show when NOT authenticated */}
          {!isAuthenticated && (
            <a
              href="/become-provider"
              onClick={(e) => {
                e.preventDefault();
                router.push("/select-user-type");
              }}
              className="inline-flex h-10 lg:h-12 items-center justify-center px-3 lg:px-4 xl:px-6 bg-[#3a599c] rounded-3xl hover:bg-[#2f4a7f] active:bg-[#1e3a5f] transition-colors touch-manipulation"
            >
              <span className="font-normal text-white text-xs lg:text-sm whitespace-nowrap">
                Become A Service Provider
              </span>
            </a>
          )}
        </div>
      </div>

      {/* Desktop Categories Dropdown */}
      {showDropdown && !isAuthenticated && (
        <div className="category-dropdown absolute left-0 right-0 z-40 top-full">
          <div className="mx-auto w-full max-w-[1440px] px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-24">
            <div className="overflow-hidden rounded-2xl lg:rounded-3xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] mt-2">
              <div className="flex">
                {/* Left: Subcategory list */}
                <div className="w-[240px] lg:w-[280px] bg-gray-50 p-4 lg:p-6 border-r border-gray-200">
                  <div className="space-y-1">
                    {selectedCategory?.subcategories?.slice(1, 16).map((sub) => {
                      const isSelected = selectedSubcategory?.title === sub.title;
                      return (
                        <button
                          key={sub.title}
                          onMouseEnter={() => setSelectedSubcategory(sub)}
                          onClick={() => setSelectedSubcategory(sub)}
                          className={`flex items-center gap-2 lg:gap-3 w-full px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg text-left transition-all touch-manipulation ${isSelected
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-700 hover:bg-white/50 active:bg-white/70"
                            }`}
                          aria-current={isSelected ? "true" : undefined}
                          tabIndex={0}
                        >
                          <span className={isSelected ? "text-[#3a599c]" : "text-gray-500"}>
                            <CheckCircle2 className="h-3 w-3 lg:h-4 lg:w-4" />
                          </span>
                          <span className="font-medium text-sm lg:text-[15px]">{sub.title}</span>
                        </button>
                      );
                    })}
                    {selectedCategory?.subcategories?.length > 16 && (
                      <div className="text-center mt-2">
                        <span className="text-xs text-gray-400">...and more</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Middle: Services for selected subcategory */}
                <div className="flex-1 p-4 lg:p-8 max-h-[400px] lg:max-h-[500px] overflow-y-auto">
                  {selectedSubcategory && (
                    <>
                      <div className="mb-4 lg:mb-6 pb-3 lg:pb-4 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-[#3a599c]"><CheckCircle2 className="h-3 w-3 lg:h-4 lg:w-4" /></span>
                          <h2 className="text-base lg:text-lg font-semibold text-gray-900">{selectedSubcategory.title}</h2>
                        </div>
                      </div>
                      <ul className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 lg:gap-x-12 gap-y-2 lg:gap-y-3">
                        {selectedSubcategory.items?.length > 0 ? (
                          selectedSubcategory.items.map((item) => (
                            <li key={item}>
                              <a
                                href="#"
                                className="flex items-start gap-2 text-xs lg:text-[14px] text-gray-600 hover:text-[#3a599c] transition-colors group touch-manipulation"
                              >
                                <CheckCircle2 className="h-3 w-3 lg:h-4 lg:w-4 text-[#3a599c] flex-shrink-0 mt-0.5 opacity-60 group-hover:opacity-100" />
                                <span>{item}</span>
                              </a>
                            </li>
                          ))
                        ) : (
                          <div className="col-span-2 text-center py-8 text-gray-500">No services available</div>
                        )}
                      </ul>
                    </>
                  )}
                </div>
                {/* Right: Promotional section */}
                <div className="hidden lg:block w-[280px] xl:w-[320px] bg-gray-50 p-4 lg:p-6 pt-32 lg:pt-40 border-l border-gray-200">
                  <div className="sticky top-6">
                    <div className="bg-white rounded-xl lg:rounded-2xl overflow-hidden shadow-sm">
                      <Image
                        src={require('../../../../public/images/web-developer.jpg')}
                        alt="Premium services"
                        width={320}
                        height={192}
                        className="w-full h-[160px] lg:h-[192px] object-cover"
                      />
                    </div>
                    <div className="mt-3 lg:mt-4">
                      <p className="text-sm lg:text-[15px] font-semibold text-gray-900 mb-2 lg:mb-3">
                        Premium services curated for your needs
                      </p>
                      <button
                        onClick={() => {
                          router.push('/Category');
                          setShowDropdown(false);
                        }}
                        className="flex items-center gap-2 text-[#3a599c] font-semibold text-xs lg:text-[14px] hover:gap-3 transition-all group touch-manipulation"
                      >
                        <span>View All Categories</span>
                        <svg
                          className="h-3 w-3 lg:h-4 lg:w-4 group-hover:translate-x-1 transition-transform"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1 8H15M15 8L8 1M15 8L8 15"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-white shadow-2xl transition-all duration-300 ease-in-out transform ${isMobileMenuOpen
          ? "translate-x-0"
          : "translate-x-full"
          }`}
        style={{
          top: "0",
          height: "100vh",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-500"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-6 space-y-6">
            {/* Mobile Categories - Only show when NOT authenticated */}
            {!isAuthenticated && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-900">Categories</h3>
                {!loading &&
                  categories.map((category) => (
                    <div key={category.id} className="space-y-2">
                      <button
                        onClick={() => toggleMobileCategory(category.id)}
                        className="w-full flex justify-between items-center px-4 py-3 rounded-lg hover:bg-gray-100 active:bg-gray-200 text-gray-700 transition-colors touch-manipulation"
                        aria-expanded={mobileCategoryOpen === category.id}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-gray-500">{category.icon}</div>
                          <span className="font-medium text-left">{category.name}</span>
                        </div>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 text-gray-400 ${mobileCategoryOpen === category.id ? "rotate-180" : ""
                            }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
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
                        <div className="pl-4 space-y-3">
                          {category.subcategories.map((sub) => (
                            <div key={sub.title} className="space-y-2">
                              <h4 className="font-medium text-gray-900 px-2">{sub.title}</h4>
                              <ul className="space-y-1">
                                {sub.items.slice(0, 5).map((item) => (
                                  <li key={item}>
                                    <a
                                      href="#"
                                      className="block py-2 px-3 text-sm text-gray-600 hover:text-[#3a599c] hover:bg-gray-50 rounded-lg transition-colors touch-manipulation"
                                    >
                                      {item}
                                    </a>
                                  </li>
                                ))}
                                {sub.items.length > 5 && (
                                  <li>
                                    <span className="block py-2 px-3 text-xs text-gray-400">
                                      +{sub.items.length - 5} more services
                                    </span>
                                  </li>
                                )}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {/* Mobile Navigation Items - Only show when NOT authenticated */}
            {!isAuthenticated && (
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Quick Links</h3>
                {navigationItems.map((item) => (
                  <a
                    key={item.name}
                    href="#"
                    className="block px-4 py-3 rounded-lg font-medium hover:bg-gray-100 active:bg-gray-200 text-gray-700 transition-colors touch-manipulation"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            )}

            {/* Mobile Buttons - Only show when NOT authenticated */}
            {!isAuthenticated && (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    router.push("/select-user-type");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-6 py-4 rounded-lg font-bold bg-[#3a599c] text-white hover:bg-[#2f4a7f] active:bg-[#1e3a5f] transition-colors touch-manipulation"
                >
                  Become A Service Provider
                </button>
                <button
                  onClick={() => {
                    router.push("/Login");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-6 py-3 rounded-lg font-medium border border-[#3a599c] text-[#3a599c] hover:bg-[#3a599c0a] active:bg-[#3a599c15] transition-colors touch-manipulation"
                >
                  Login
                </button>
              </div>
            )}

            {/* Mobile Action Buttons - Only show if authenticated */}
            {shouldShowUserDropdown && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-900">Account</h3>
                
                {/* User Info */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center border-gray-300 bg-gray-100">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {user?.name || user?.username || user?.slug || `User${user?.id}` || "User"}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">{user?.user_type}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {/* Dashboard Button */}
                  <button
                    onClick={() => {
                      router.push(getDashboardPath());
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-gray-100 active:bg-gray-200 text-gray-700 transition-colors touch-manipulation"
                  >
                    <Layers className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Dashboard</span>
                  </button>

                  {/* Message Button */}
                  <button
                    onClick={() => {
                      handleMessageClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-gray-100 active:bg-gray-200 text-gray-700 transition-colors touch-manipulation"
                  >
                    <MessageCircle className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Messages</span>
                  </button>

                  {/* Notification Button */}
                  <div className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-gray-100 active:bg-gray-200 text-gray-700 transition-colors touch-manipulation">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Notifications</span>
                    <div className="ml-auto">
                      <UserNotificationDropdown userType={user?.user_type?.toLowerCase()} />
                    </div>
                  </div>

                  {/* Profile Button - Only for non-customers */}
                  {user?.user_type !== "Customer" && user?.user_type !== "customer" && (
                    <button
                      onClick={() => {
                        const profileSlug = slug || user?.slug;
                        router.push(`/profileView/${profileSlug}`);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-gray-100 active:bg-gray-200 text-gray-700 transition-colors touch-manipulation"
                    >
                      <Settings className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">My Profile</span>
                    </button>
                  )}

                  {/* Online/Offline Toggle - Only for Freelancers */}
                  {isFreelancer && (
                    <button
                      onClick={() => {
                        handleOnlineToggle();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors touch-manipulation ${isOnline
                          ? "bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-300"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                        }`}
                    >
                      {isOnline ? (
                        <Wifi className="w-5 h-5" />
                      ) : (
                        <WifiOff className="w-5 h-5" />
                      )}
                      <span className="font-medium">{isOnline ? "Online" : "Offline"}</span>
                    </button>
                  )}

                  {/* Mobile Verification Button */}
                  {!isMobileVerified && (
                    <button
                      onClick={() => {
                        handleVerifyPhone();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 active:bg-orange-300 transition-colors touch-manipulation"
                    >
                      <Shield className="w-5 h-5" />
                      <span className="font-medium">Verify Phone</span>
                    </button>
                  )}

                  {/* Logout Button */}
                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors touch-manipulation"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onSuccess={handleVerificationSuccess}
      />

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />
    </header>
  );
};

export default Header;
