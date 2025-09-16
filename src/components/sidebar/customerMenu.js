import { FaTachometerAlt, FaBriefcase, FaUser } from "react-icons/fa";

export const customerMenu = [
  {
    icon: <FaTachometerAlt className="w-4 h-4" />,
    name: "Dashboard",
    subItems: [
      { name: "Analytics", path: "/customer-dashboard/Analytics", pro: false },
      { name: "Message", path: "/customer-dashboard/message", pro: false },
    ],
  },
  {
    icon: <FaBriefcase className="w-4 h-4" />,
    name: "Post a Job",
    subItems: [
      { name: "New Job", path: "/customer-dashboard/job-post" },
      { name: "Manage Jobs", path: "/customer-dashboard/job-list" },
    ],
  },
  {
    icon: <FaUser className="w-4 h-4" />,
    name: "Account",
    subItems: [{ name: "Change Password", path: "/customer-dashboard/Changepassword", pro: false },
               { name: "Delete Profile", path: "/customer-dashboard/Deleteprofile", pro: false }
    ]
  },
];
