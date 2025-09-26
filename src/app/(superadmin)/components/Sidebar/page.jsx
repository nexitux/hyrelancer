"use client"
import React, { useState, useEffect } from 'react';
import { 
  MdDashboard, 
  MdCategory, 
  MdPeople, 
  MdWork, 
  MdMiscellaneousServices,
  MdChevronRight,
  MdMenu,
  MdClose,
  MdLightMode,
  MdDarkMode
} from 'react-icons/md';
import Image from "next/image";
import { usePathname, useRouter } from 'next/navigation';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true); 
  const [openMenus, setOpenMenus] = useState({});
  const router = useRouter();
  const pathname = usePathname();

  // Set initial active item based on current path
  useEffect(() => {
    const currentPath = pathname;
    menuItems.forEach(item => {
      if (currentPath.startsWith(item.href)) {
        setOpenMenus(prev => ({ ...prev, [item.id]: true }));
      }
    });
  }, [pathname]);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleMenu = (id) => {
    setOpenMenus((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const navigateTo = (path) => {
    router.push(path);
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: MdDashboard, 
      href: '/superadmin/control',
      subLinks: [
        { id: 'analytics', label: 'Analytics', href: '/control/analytics' },
      ]
    },
    { 
      id: 'categories', 
      label: 'Categories', 
      icon: MdCategory, 
      href: '/superadmin/category',
      subLinks: [
        { id: 'categories-list', label: 'Category List', href: '/control/category' },
        { id: 'categories-add', label: 'Add Category', href: '/control/category/add-category' }
      ]
    },
    { 
      id: 'services', 
      label: 'Services', 
      icon: MdMiscellaneousServices, 
      href: '/superadmin/services',
      subLinks: [
        { id: 'services-list', label: 'Service List', href: '/control/ServicesList' },
        { id: 'services-ad', label: 'Add Service', href: '/control/ServicesList/addService' }
      ]
    },
    { 
      id: 'jobs', 
      label: 'Jobs', 
      icon: MdMiscellaneousServices, 
      href: '/superadmin/services',
      subLinks: [
        { id: 'jobslist', label: 'Jobs List', href: '/control/joblist' }
      ]
    },
    { 
      id: 'freelancers', 
      label: 'Freelancers', 
      icon: MdWork, 
      href: '/freelancers',
      subLinks: [
        { id: 'freelancers-lists', label: 'Freelancer List', href: '/control/freelancelist' },
        { id: 'freelancers-add', label: 'Add Freelancer', href: '/control/freelancelist/addFreelancer' },
        { id: 'freelancers-suggestions', label: 'Freelancer Suggestions', href: '/control/freelancelist/SuggectionFreelancer' },
        { id: 'freelancers-approval', label: 'Approve Freelancer', href: '/control/freelancelist/approval' },
      ]
    },
    { 
      id: 'customer', 
      label: 'customer', 
      icon: MdPeople, 
      href: '/customer',
      subLinks: [
        { id: 'customer-list', label: 'Customer List', href: '/control/customerlist' },
        { id: 'customer-add', label: 'Add Customer', href: '/control/customerlist/addCustomer' },
      ]
    },
    { 
      id: 'AdminSupport', 
      label: 'AdminSupport', 
      icon: MdPeople, 
      href: '/AdminSupport',
      subLinks: [
        { id: 'AdminSupport', label: 'Ticekt List', href: '/control/AdminSupport' },
        
      ]
    },
    { 
      id: 'badgesList', 
      label: 'badgesList', 
      icon: MdPeople, 
      href: '/badgesList',
      subLinks: [
        { id: 'badgesList', label: 'Badges List', href: '/control/badgesList' },
        
      ]
    },
  ];

  const isActive = (href) => {
    return pathname.startsWith(href);
  };

  return (
    <div className="flex">
      <aside className={`transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      } min-h-screen shadow-xl relative 
        bg-gradient-to-b from-slate-900 to-slate-800 text-white 
        dark:from-gray-100 dark:to-gray-200 dark:text-gray-900`}>
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700 dark:border-gray-300">
          <div className="flex justify-between items-center">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="flex overflow-hidden justify-center items-center">
                  <Image
                    src="/images/logo copy.jpg"
                    alt="Dashboard"
                    width={40}
                    height={20}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white dark:text-gray-900">Hyrelancer</h2>
                  <p className="text-xs text-slate-400 dark:text-gray-600">Admin Panel</p>
                </div>
              </div>
            )}
            <div className="flex gap-2 items-center">
              {/* Theme toggle */}
              <button 
                onClick={toggleTheme} 
                className="p-1.5 rounded-lg hover:bg-slate-700 dark:hover:bg-gray-300 transition-colors"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
              </button>

              {/* Collapse toggle */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 rounded-lg hover:bg-slate-700 dark:hover:bg-gray-300 transition-colors"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? <MdMenu size={20} /> : <MdClose size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasSubLinks = item.subLinks && item.subLinks.length > 0;
            const isOpen = openMenus[item.id];

            return (
              <div key={item.id}>
                {/* Parent Button */}
                <button
                  onClick={() => {
                    if (hasSubLinks) {
                      toggleMenu(item.id);
                    } else {
                      navigateTo(item.href);
                    }
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                    ${isActive(item.href)
                      ? 'text-white bg-gradient-to-r from-blue-500 to-blue-600 dark:text-white' 
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white dark:text-gray-700 dark:hover:bg-gray-300 dark:hover:text-black'
                    }`}
                >
                  <div className="flex-shrink-0">
                    <Icon size={20} />
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className="font-medium">{item.label}</span>
                      <div className="flex-1" />
                      {hasSubLinks && (
                        <MdChevronRight 
                          size={16} 
                          className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} 
                        />
                      )}
                    </>
                  )}
                </button>

                {/* Submenu Items */}
                {hasSubLinks && isOpen && !isCollapsed && (
                  <div className="mt-1 ml-10 space-y-1">
                    {item.subLinks.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => navigateTo(sub.href)}
                        className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors
                          ${isActive(sub.href)
                            ? 'bg-blue-500 text-white dark:bg-blue-600 dark:text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700 dark:text-gray-700 dark:hover:bg-gray-300 dark:hover:text-black'
                          }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Section */}
        {!isCollapsed && (
          <div className="absolute right-0 bottom-0 left-0 p-4 border-t border-slate-700 dark:border-gray-300">
            <div className="p-3 bg-gradient-to-r rounded-xl border from-blue-500/10 to-blue-600/10 border-blue-500/20 dark:from-gray-200 dark:to-gray-300 dark:border-gray-400">
              <h4 className="mb-1 text-sm font-medium text-white dark:text-gray-900">Need Help?</h4>
              <p className="mb-2 text-xs text-slate-400 dark:text-gray-600">Contact our support team</p>
              <button 
                onClick={() => navigateTo('/support')}
                className="py-2 w-full text-xs text-white bg-blue-500 rounded-lg transition-colors hover:bg-blue-600"
              >
                Get Support
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}