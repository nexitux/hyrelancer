import { FaTachometerAlt, FaBriefcase, FaUser, FaHeadset, FaComments, FaBell } from "react-icons/fa";

export const customerMenu = [
  {
    icon: <FaTachometerAlt className="w-4 h-4" />,
    name: "Dashboard",
    path: "/customer-dashboard/Analytics",
    pro: false,
  },
  {
    icon: <FaComments className="w-4 h-4" />,
    name: "Messages",
    path: "/customer-dashboard/message",
    pro: false,
  },
  {
    icon: <FaBell className="w-4 h-4" />,
    name: "Notifications",
    path: "/customer-dashboard/notifications",
    pro: false,
  },
  {
    icon: <FaBriefcase className="w-4 h-4" />,
    name: "Manage Jobs",
    subItems: [
      { name: "Add Job", path: "/customer-dashboard/job-post" },
      { name: "Posted Jobs", path: "/customer-dashboard/job-list" },
      { name: "Freelancers Request", path: "/customer-dashboard/work-request" },
    ],
  },
  {
    icon: <FaUser className="w-4 h-4" />,
    name: "Account",
    subItems: [{ name: "Change Password", path: "/customer-dashboard/Changepassword", pro: false },
               { name: "Delete Profile", path: "/customer-dashboard/Deleteprofile", pro: false },
               { name: "Deactivate Profile", path: "/customer-dashboard/acc-active", pro: false }
    ]
  },
  {
    icon: <FaHeadset className="w-4 h-4" />,
    name: "Support Tickets",
    subItems: [{ name: "Support Tickets", path: "/customer-dashboard/support-tickets", pro: false }
    ]
  },
 
];
