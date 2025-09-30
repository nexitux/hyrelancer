import { FaTachometerAlt, FaBriefcase, FaUser, FaComments } from "react-icons/fa";

export const freelancerMenu = [
  {
    icon: <FaTachometerAlt className="w-4 h-4" />,
    name: "Dashboard",
    path: "/freelancer-dashboard/analytics",
    pro: false,
  },
  {
    icon: <FaComments className="w-4 h-4" />,
    name: "Messages",
    path: "/freelancer-dashboard/message",
    pro: false,
  },
  {
    icon: <FaBriefcase className="w-4 h-4" />,
    name: "Manage Jobs",
    subItems: [
      { name: "Job List", path: "/freelancer-dashboard/job-details", pro: false },
      { name: "Active Works", path: "/freelancer-dashboard/active-works", pro: false },
      { name: "Applied Jobs", path: "/freelancer-dashboard/applied-jobs", pro: false },
      { name: "Bookmarks", path: "/freelancer-dashboard/bookmarks", pro: false },
      { name: "Job Alerts", path: "/freelancer-dashboard/job-alerts", pro: false },
    ],
  },
  {
    icon: <FaBriefcase className="w-4 h-4" />,
    name: "Profile Settings",
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
    name: "Account Settings",
    subItems: [{ name: "Change Password", path: "/freelancer-dashboard/Changepassword", pro: false },
               { name: "Delete Profile", path: "/freelancer-dashboard/Deleteprofile", pro: false },
               { name: "Deactivate Profile", path: "/freelancer-dashboard/acc-active", pro: false }
    ]
  },
  {
    icon: <FaUser  className="w-4 h-4" />,
    name: "Support Tickets",
    subItems: [{ name: "Support Tickets", path: "/freelancer-dashboard/support-tickets", pro: false }
    ]
  },
];
