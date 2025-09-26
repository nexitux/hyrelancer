"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout, updateUserProfile } from "@/redux/slices/authSlice";
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
} from "lucide-react";
import Logo from "../../../../public/images/image.png";
import Image from "next/image";
import api from "@/config/api";

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
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user, slug, token, isAuthenticated } = useSelector(state => state.auth);
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

  const userMenuItems = [
    {
      name: "Dashboard",
      icon: <Layers className="w-4 h-4" />,
      onClick: () => {
        router.push("/freelancer-dashboard");
        setShowUserDropdown(false);
      },
    },
    {
      name: "My Profile",
      icon: <Settings className="w-4 h-4" />,
      onClick: () => {
        const profileSlug = slug || user?.slug;
        router.push(`/profileView/${profileSlug}`);
        setShowUserDropdown(false);
      },
    },
    {
      name: "Logout",
      icon: <LogOut className="w-4 h-4" />,
      onClick: handleLogout,
    },
  ];

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
          {/* User Dropdown - Only show if authenticated and not on login/register pages */}
          {shouldShowUserDropdown && (
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
    </header>
  );
};

export default Header;
