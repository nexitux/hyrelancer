import { FaTachometerAlt, FaBriefcase, FaUser,SupportIcon } from "react-icons/fa";

export const freelancerMenu = [
  {
    icon: <FaTachometerAlt className="w-4 h-4" />,
    name: "Dashboard",
    subItems: [
      { name: "Analytics", path: "/freelancer-dashboard/analytics", pro: false },
      // { name: "Services", path: "/services", pro: false },
      { name: "Messages", path: "/freelancer-dashboard/message", pro: false },
      // { name: "Bookmarks", path: "/freelancer-dashboard/bookmarks", pro: false },
      { name: "Job Alerts", path: "/freelancer-dashboard/job-alerts", pro: false },
      { name: "Applied Jobs", path: "/freelancer-dashboard/applied-jobs", pro: false },
      { name: "My Proposals", path: "/freelancer-dashboard/proposals", pro: false },
      // { name: "My Services", path: "/freelancer-dashboard/my-services", pro: false },
      { name: "Active Works", path: "/freelancer-dashboard/active-works", pro: false },
      // { name: "Service Orders", path: "/freelancer-dashboard/service-orders", pro: false },
      { name: "Job List", path: "/job-details", pro: false },
      // { name: "Profile", path: "/freelancer-dashboard/profileView", pro: false },
    ],
  },
  {
    icon: <FaBriefcase className="w-4 h-4" />,
    name: "Account Settings",
    subItems: [
      { name: "My profile", path: "/profile-setup/my-profile", pro: false },
      { name: "Services", path: "/profile-setup/services", pro: false },
      { name: "Education & Experience", path: "/profile-setup/education-experience", pro: false },
      { name: "Portfolio", path: "/profile-setup/portfolio", pro: false },
      { name: "Social Media", path: "/profile-setup/social-media", pro: false },
    ],
  },
  {
    icon: <FaUser className="w-4 h-4" />,
    name: "Account",
    subItems: [{ name: "Change Password", path: "/freelancer-dashboard/Changepassword", pro: false },
               { name: "Delete Profile", path: "/freelancer-dashboard/Deleteprofile", pro: false }
    ]
  },
  {
    icon: <FaUser  className="w-4 h-4" />,
    name: "Support Tickets",
    subItems: [{ name: "Support Tickets", path: "/freelancer-dashboard/support-tickets", pro: false }
    ]
  },
];
